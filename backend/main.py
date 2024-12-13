from dotenv import load_dotenv
import os, random
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import firebase_admin
from firebase_admin import credentials, firestore, exceptions

# Load environment variables for Spotify API secret & ID
env_path = os.path.join(os.path.dirname(__file__), 'dependencies','.env')
load_dotenv(env_path)
SPOTIPY_CLIENT_ID = os.getenv('SPOTIPY_CLIENT_ID')
SPOTIPY_CLIENT_SECRET = os.getenv('SPOTIPY_CLIENT_SECRET')

# Initialize Spotify API client
auth_manager = SpotifyClientCredentials(client_id=SPOTIPY_CLIENT_ID, client_secret=SPOTIPY_CLIENT_SECRET)
sp = spotipy.Spotify(auth_manager=auth_manager)

# Initialize Firebase
cred = credentials.Certificate("./dependencies/serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Firebase db Config
db_environment = "dev"

# Global count variable for album number
count = 0

# Retrieves and returns the total number of used daily albums in the db.
# Document must contain collection array 'used'
def getTotalAlbumCount(collection, document):
    global count
    doc_ref = db.collection(collection).document(document)
    doc = doc_ref.get()
    
    if doc.exists:
        data = doc.to_dict()
        if 'used' in data:
            count = len(data['used'])
            return count
        else:
            print(f"The document '{document}' does not contain the 'used' array.")
            return None
    else:
        print(f"The document '{document}' does not exist.")
        return None
    
def getPreviousAlbumIDs(collection, document, range=100):
    doc_ref = db.collection(collection).document(document)
    doc = doc_ref.get()

    if doc.exists:
        data = doc.to_dict()
        if 'used' in data:
            used_albums = data['used']
            start_index = max(0, len(used_albums) - range)
            return used_albums[start_index:]
        else:
            print(f"The document '{document}' does not contain the 'used' array.")
            return None
    else:
        print(f"The document '{document}' does not exist.")
        return None


# Verifies a playlist given its Spotify ID. Returns True if the playlist exists, False otherwise.
def verifyPlaylistID(playlist_id):
    try:
        playlist = sp.playlist(playlist_id)
        if playlist:
            print(f"Playlist ID {playlist_id} verified.")
            return True
        else:
            print(f"Playlist ID {playlist_id} not found.")
            return False
    except Exception as e:
        print(f"An error occurred while verifying the playlist ID.")
        return False

# Extracts and verifies playlist IDs from Firestore. Returns a dictionary of valid playlist IDs.    
def extractAndVerifyPlaylistIDs(collection, document):
    doc_ref = db.collection(collection).document(document)
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        keys = data.keys()
        total_ids = 0
        total_keys = len(keys)
        ids_dict = {}

        for key in keys:
            values = data[key]
            ids_dict[key] = [value['id'] for value in values]
            for _ in values:
                total_ids += 1

        print(f"Found {total_ids} IDs across {total_keys} keys.")
        initial_ids = total_ids

        for key in list(ids_dict.keys()):
            ids = ids_dict[key]
            ids_to_remove = []
            for id in ids:
                if not verifyPlaylistID(id):
                    ids_to_remove.append(id)
            for id in ids_to_remove:
                ids.remove(id)
            if not ids:
                del ids_dict[key]

        for key, ids in ids_dict.items():
            verified_count = len(ids)
            print(f"Verified ({verified_count}/{initial_ids}) playlist IDs.")
        
        if not ids_dict:
            print("No valid playlist IDs found.")
            return None
        else:
            return ids_dict
        
def selectRandomPlaylist(playlist_dict):
    if not playlist_dict:
        return None
    print("Selecting a random playlist...")
    keys = list(playlist_dict.keys())
    random_key = random.choice(keys)
    random_playlist = random.choice(playlist_dict[random_key])
    print(f"Selected playlist: {random_playlist}")
    return random_playlist

def getTracksFromPlaylist(playlist_id):
    try:
        playlist = sp.playlist(playlist_id, fields="tracks(total)")
        total_tracks = playlist['tracks']['total']
        
        if total_tracks > 10:
            offset = random.randint(0, total_tracks - 10)
        else:
            offset = 0
        
        tracklist = sp.playlist_tracks(playlist_id, limit=10, offset=offset, fields="items(track(id))")
        tracks = [item['track']['id'] for item in tracklist['items']]
        
        print(f"Successfully selected tracks w/offset: ({offset}).")
        return tracks
    except Exception as e:
        print(f"An error occurred while retrieving the tracklist: {e}")
        return None
    
def isSingleOrAlbum(track_id):
    try:
        track = sp.track(track_id)
        album_type = track['album']['album_type']
        if album_type == 'single':
            return 'single'
        elif album_type == 'album':
            return 'album'
        else:
            print(f"Track ID {track_id} an unrecognized type: {album_type}")
            return album_type
    except Exception as e:
        print(f"An error occurred while checking the track: {e}")
        return None
    
def getAlbumID(track_id):
    try:
        track = sp.track(track_id)
        album_id = track['album']['id']
        return album_id
    except Exception as e:
        print(f"An error occurred while retrieving the album ID: {e}")
        return None
    
def getAlbumData(album_id):
    try:
        album = sp.album(album_id)
        return album
    except Exception as e:
        print(f"An error occurred while retrieving the album data: {e}")
        return None
    
# Add album to firestore. If append is True, add to existing array. Else, replace the document. Append should be false for adding to 'current'.
def addAlbum(album_data, document, append=True):
    if not isinstance(album_data, dict):
        print("Error: album_data must be a dictionary.")
        return
    doc_ref = db.collection(db_environment).document(document)
    album_data = {
        'albumName': album_data['name'],
        'artistName': album_data['artists'][0]['name'],
        'albumCover': album_data['images'][0]['url'],
        'id': album_data['id'],
        'albumNum': count + 1
    }
    print(f"Adding album with data: {album_data}")

    if append:
        doc_ref.update({"used": firestore.ArrayUnion([album_data])})
        print(f"Successfully added album to 'previous'.")
    else:
        doc_ref.set(album_data)
        print(f"Successfully added album to 'current'.")


# Entrypoint
def main():
    # Verify that the collection and documents exist in the database
    try:
        collection_name = db_environment
        collection = db.collection(collection_name)
        if not collection.get():
            print(f"Collection '{db_environment}' does not exist.")
            return
        else:
            print(f"Verified collection '{db_environment}'. Proceeding to verify documents...")

        current, playlists, previous = (collection.document(doc) for doc in ["current", "playlists", "previous"])

        for doc_ref in [current, playlists, previous]:
            if not doc_ref.get().exists:
                print(f"Document '{doc_ref.id}' does not exist.")
                return
            else:
                print(f"Verified document '{doc_ref.id}'.")
        if current and playlists and previous:
            print("All documents & collections verified! Proceeding...")
    except exceptions.NotFoundError as e:
        print(f"An error occurred while retrieving the document: {e}")
        return
    
    try:
        # Get total album count from database by reading total count from previous document
        album_count = getTotalAlbumCount(collection_name, "previous")
        if album_count:
            print(f"Album count: {album_count}")
        else:
            print("No album count found.")
            return
    except Exception as e:
        print(f"An error occurred while retrieving the album count: {e}")
        return
    
    # Extract and verify playlist IDs
    playlist_dict = extractAndVerifyPlaylistIDs(collection_name, "playlists")
    if not playlist_dict:
        print("Terminating due to lack of valid playlist IDs.")
        return
    

    while True:
        random_playlist = selectRandomPlaylist(playlist_dict)
        tracklist = getTracksFromPlaylist(random_playlist)
        album_pool = []

        # Only add tracks part of an album to the album pool
        if tracklist:
            tracklist = [track_id for track_id in tracklist if isSingleOrAlbum(track_id) != 'single']
            for track_id in tracklist:
                album_id = getAlbumID(track_id)
                album_pool.append(album_id)

            # Go through each album id, check if its been used:
            for album_id in album_pool:
                if album_id in getPreviousAlbumIDs(collection_name, "previous"):
                    album_pool.remove(album_id)
                    print(f"Removed used album ID: {album_id}")
            
            # If filtered album pool is not empty, proceed. Else try again.
            if album_pool:
                print("Successfully filtered album pool with valid & unused IDs.")
                break
    
    # Begin album selection routine
    album_id = random.choice(album_pool)
    album_data = getAlbumData(album_id)
    if album_data:
        print(f"Selected album: {album_data['name']}")
        try:
            # Add to current, append is false since we're replacing the document
            addAlbum(album_data, "current", append=False)
            # Add to previous, append is true to add to existing array
            addAlbum(album_data, "previous", append=True)
        except Exception as e:
            print(f"An error occurred while adding the album to Firestore: {e}")

if __name__ == "__main__":
    main()
