/*
Using Node.js for ease of importing bigquery client in Lambda 
*/
const {BigQuery} = require('@google-cloud/bigquery');
const Sentiment = require('sentiment');

const datasetId = 'twitter_posts';
const tableId = 'posts';

async function insertRowsAsStream(rows) {
    const bigquery = new BigQuery({
            projectId : process.env.PROJECT_ID,
            keyFilename: './service_account.json'
        }
    );
    // Inserts the JSON objects 
    await bigquery
        .dataset(datasetId)
        .table(tableId)
        .insert(rows)
        .catch(e=>{
            console.log("Error inserting to bq", e)
        });
    console.log(`Inserted ${rows.length} rows`);
}

exports.handler = async (event, context) => {
  
    var sentiment = new Sentiment();
    /* Process the list of records and transform them */
    const rows = event.Records.map(record => {
        var payload = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('ascii'));
        return {
            ...payload,
            engagement : payload.userFollowerCount > 0 ? (
                (
                    (payload.replyCount ? payload.replyCount : 0) + 
                    (payload.retweetCount ? payload.retweetCount : 0) + 
                    (payload.favoriteCount ? payload.favoriteCount : 0) + 
                    (payload.quoteCount ? payload.quoteCount : 0)
                ) / parseFloat(payload.userFollowerCount ? payload.userFollowerCount : 1)
            ) * 100 : null,
            sentiment : payload.text ? sentiment.analyze(payload.text).comparative : null
        }
    });
    
    console.log(rows);
    
    await insertRowsAsStream(rows);

    console.log(`Processing completed. Successful records ${rows.length}.`);
    return { records: rows };
};
