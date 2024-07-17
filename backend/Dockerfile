FROM python:3.12.0

RUN mkdir /app
ADD main.py /app
ADD dependencies /app/dependencies
ADD requirements.txt /app

WORKDIR /app
RUN pip install --no-cache-dir -r requirements.txt

ENTRYPOINT [ "python" ]
CMD [ "main.py" ]