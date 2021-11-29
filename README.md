# Real-time Twitter Music NFT Streams

This is a short project that I designed to learn more about data streaming at scale. To supplement my interest in keeping track of the Web 3.0/NFT ecosystem, specifically in the music industry, I wanted to track all tweets that were related to the keywords "music", "NFT", "ETH", "web3", and "Opensea" (largest NFT marketplace). As we enter 2022, I'm especially curious how celebrity/major label adoption of NFTs (ie [BTS](https://techcrunch.com/2021/11/04/bts-enters-nft-market-in-joint-venture-with-upbit/), [Bored Ape Yacht Club](https://www.billboard.com/music/music-news/bored-ape-yacht-club-nft-metaverse-band-9658947/) via Universal Music Group, etc.) will impact the social dialog and perception of this space. 

**Link to: [Data Studio Dashboard](https://datastudio.google.com/reporting/c08d54e6-5bc0-4c75-8beb-0a5a0d7f9ecd) (Updates every 15 minutes)**

<img src="Data Studio SS.png" width="500"/>

## Data Architecture
<img src="Architecture Diagram.png" />

### Flow of Data
1. Producer (EC2) establishes API connection through Twitter's Streaming HTTP Protocol. Producer delivers this data to Kinesis Data Stream. 
2. Kinesis Firehose (ETL Service) receives this data from Kinesis Data Stream and infers JSON schema with AWS Glue (Managed ETL). 
3. Kinesis Firehose converts the data format from JSON to Parquet and dumps the files to S3 in 5 minute intervals. 
4. Consumer (Lambda function) is also triggered from Kinesis Firehose, performs simple statistical analyses (sentiment analysis and engagement calculations), and dumps the data into Google BigQuery (Cloud Data Warehouse). 
5. The data in BigQuery is aggregated in real-time to a Data Studio dashboard (refereshed every 15 minutes). 

## Extensions
Possible extensions which I have explored but have not yet implemented (mainly due to costs) are:
1. Utilize Spark to perform streaming inference (ie. implement sentiment analysis predictions).
2. Train ML models (sentiment, entity classification, etc.) from S3 data, deploying an AWS Sagemaker endpoint for production.
3. Gather NFT market sales data. 
