from dotenv import load_dotenv
import os, random
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import firebase_admin
from firebase_admin import credentials, firestore

env_path = os.path.join(os.path.dirname(__file__), 'dependencies','.env')
load_dotenv(env_path)
SPOTIPY_CLIENT_ID = os.getenv('SPOTIPY_CLIENT_ID')
SPOTIPY_CLIENT_SECRET = os.getenv('SPOTIPY_CLIENT_SECRET')
auth_manager = SpotifyClientCredentials(client_id=SPOTIPY_CLIENT_ID, client_secret=SPOTIPY_CLIENT_SECRET)
sp = spotipy.Spotify(auth_manager=auth_manager)

db_environment = "dev"
playlist_titles = ["hiphop", "pop", "generic", "r&b", "rock", "static"]
count = 0

cred = credentials.Certificate("./dependencies/serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def extractAlbumCount():
    global count
    count_data = db.collection(db_environment).document("current").get().to_dict()
    if count_data and 'albumNum' in count_data:
        count = count_data['albumNum']
        print(f"Album count: {count}")
    else:
        print("No album count found.")
        pass

extractAlbumCount()

def main():
    global count
    playlist_pool = []
    random_playlist = None
    random_album = None
    playlist_tracks = []
    album_pool = []
    previous_ids = []
    

    # Select random playlist
    try:
        print("Choosing random playlist...")
        for title in playlist_titles:
            playlists = dbPlaylistData(title)
            playlist_pool.extend(playlists)
        get_random = random.choice(playlist_pool)
        random_playlist = next(iter(get_random))
        print(f"Picked: {random_playlist}")
    except Exception as e:
        print(f"Error trying to select random playlist: {e}")

    # Get tracks from random playlist
    if random_playlist:
        try:
            print("Getting playlist data from Spotify...")
            tracks = getPlaylist(random_playlist)
            playlist_tracks.extend(tracks)
        except Exception as e:
            print(f"Error trying to get playlist data: {e}")
    
    # Get albums from playlist tracks
    if playlist_tracks:
        try:
            print("Getting album data from Spotify...")
            albums = getAlbum(playlist_tracks)
            album_pool.extend(albums)
        except Exception as e:
            print(f"Error trying to get album data: {e}")

    # Select random album
    if album_pool:
        try:
            print("Choosing random album...")
            get_random = random.choice(album_pool)
            random_album = get_random
            print(f"Picked: {random_album}")
        except Exception as e:
            print(f"Error trying to select random album: {e}")

    # Check if random album id is in database
    previous_ids = getPreviousIds()
    if len(previous_ids) > 500:
        excess = len(previous_ids) - 500
        ignore_count = (excess // 100) * 100 
        print(f"IDs exceed 500. Ignoring first {ignore_count}...")
        previous_ids = previous_ids[ignore_count:]
    if not previous_ids:
        print("No previous IDs found. Adding...")
        count += 1
        addAlbum(random_album, "previous", False)
        addAlbum(random_album, "current", True)
        
    else:
        if random_album in previous_ids:
            print("Album already used. Trying again...")
            main()
        else:
            print("Adding album to previous and current...")
            count += 1
            addAlbum(random_album, "previous", False)
            addAlbum(random_album, "current", True)
            print("Album added successfully.")
            

# Returns track ids from given playlist
def getPlaylist(playlist_id):
    tracks = []
    playlist = sp.playlist(playlist_id)
    for track in playlist['tracks']['items']:
        tracks.append(track['track']['id'])
    return tracks

# Returns all unique album ids from given track list
def getAlbum(track_list):
    albums = []
    seen = set() 
    for track_id in track_list:
        track = sp.track(track_id)
        album_id = track['album']['id']
        if track['album']['album_type'] == 'album' and album_id not in seen:
            albums.append(album_id)
            seen.add(album_id)
    return albums

def addAlbum(album_id, collection, replace=True):
    album = sp.album(album_id)
    album_data = {
        'albumName': album['name'],
        'artistName': album['artists'][0]['name'],
        'albumCover': album['images'][0]['url'],
        'id': album_id,
        'albumNum': count
    }
    if replace:
        db.collection(db_environment).document(collection).set(album_data)
    else:
        db.collection(db_environment).document(collection).update({"used": firestore.ArrayUnion([album_data])})

def dbPlaylistData(collection):
    playlist_data = []
    try:
        playlist_doc_ref = db.collection(db_environment).document("playlists")
        playlist_doc = playlist_doc_ref.get()
        
        if playlist_doc.exists:
            print(f"Got {collection} Data")
            collection = playlist_doc.to_dict().get(collection, [])
            if collection:
                for data in collection:
                    id = data.get('id')
                    playlist_data.append({id})
            else:
                print(f"No data found in the '{collection}' array.")
        else:
            print("The 'playlists' document does not exist.")
    except Exception as e:
        print(f"An error occurred: {e}")
    return playlist_data

def getPreviousIds():
    used_ids = []
    try:
        previous_doc_ref = db.collection(db_environment).document("previous")
        previous_doc = previous_doc_ref.get()

        if previous_doc.exists:
            print("Got Previous Data")
            used_items = previous_doc.to_dict().get('used', [])
            if not used_items:
                print("IDs are empty.")
            else:
                used_ids = [item['id'] for item in used_items if 'id' in item]
        else:
            print("The 'previous' document does not exist.")
    except Exception as e:
        print(f"An error occurred: {e}")
    return used_ids

if __name__ == '__main__':
    main()