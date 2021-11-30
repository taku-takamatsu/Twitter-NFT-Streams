from tweepy import OAuthHandler
from tweepy import Stream
import json
import boto3
import time
import os
from dotenv import load_dotenv
load_dotenv()

from extract_tweets import extract_tweet_info

stream_name=os.environ['STREAM_NAME']
class TweetStreamListener(Stream):
    # on success
    def on_data(self, data):
        """Overload this method to have some processing on the data before putting it into kiensis data stream
        """
        tweet = json.loads(data)
        try:
            payload = extract_tweet_info(tweet)
            print(payload)
            # only put the record when message is not None
            if (payload):
                # note that payload is a list
                put_response = kinesis_client.put_record(
                    StreamName=stream_name,
                    Data=json.dumps(payload),
                    PartitionKey=str(tweet['user']['screen_name'])
                )
            return True
        except (AttributeError, Exception) as e:
            print(e)

    def on_error(self, status):
        print(status)

if __name__ == '__main__':
    # create kinesis client connection
    session = boto3.Session()

    # create the kinesis client
    kinesis_client = session.client('kinesis', region_name='us-east-1')
    
    while True:
        try:
            print('Twitter streaming...')
            # create instance of the tweet stream listener
            stream = TweetStreamListener(
                os.environ['TWITTER_API_KEY'], os.environ['TWITTER_API_SECRET'],
                os.environ['TWITTER_ACCESS_TOKEN'], os.environ['TWITTER_ACCESS_TOKEN_SECRET']
            )
            # search twitter for the keyword
            stream.filter(track=["NFT music", "ETH music", "web3 music", "Opensea music"], languages=['en'], stall_warnings=True)
        except Exception as e:
            print(e)
            print('Disconnected...')
            time.sleep(5)
            continue