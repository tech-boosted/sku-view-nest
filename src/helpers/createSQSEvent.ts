import * as AWS from 'aws-sdk';
AWS.config.update({ region: 'us-east-2' });

interface CreateSQSEventProps {
  sqs_queue_url: string;
  sqs_body: any;
}

export const createSQSEvent = async ({
  sqs_queue_url,
  sqs_body,
}: CreateSQSEventProps) => {
  // Enqueue message to SQS
  const sqs = new AWS.SQS();
  const queueUrl = sqs_queue_url;

  if (!queueUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify('SQS Queue URL missing!'),
    };
  }

  const sqs_response = await sqs
    .sendMessage({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(sqs_body),
    })
    .promise();

  console.log('sqs_response: ', sqs_response);

  return;
};
