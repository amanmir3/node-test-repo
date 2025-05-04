pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1' // Change to your desired AWS region
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id') // Jenkins credentials
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key') // Jenkins credentials
        LAMBDA_FUNCTION_NAME = 'your-lambda-function-name' // Change to your Lambda function name
        S3_BUCKET = 'your-s3-bucket-name' // Change to your S3 bucket name
        ZIP_FILE = 'your-lambda-function.zip' // Change to your ZIP file path
        LOG_GROUP_NAME = "/aws/lambda/${LAMBDA_FUNCTION_NAME}" // CloudWatch log group
        X_RAY_TRACING = 'Active' // Enable X-Ray tracing
    }

    stages {
        stage('Build') {
            steps {
                script {
                    // Install Node.js 18 using nvm
                    sh 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash'
                    sh 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"'
                    sh 'nvm install 18'
                    sh 'nvm use 18'

                    // Install npm dependencies
                    sh 'npm install'
                    // Package the Lambda function into a ZIP file
                    sh "zip -r ${ZIP_FILE} ."
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: "${ZIP_FILE}", fingerprint: true
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // Upload the ZIP file to S3
                    sh "aws s3 cp ${ZIP_FILE} s3://${S3_BUCKET}/"
                    // Update the Lambda function code
                    sh "aws lambda update-function-code --function-name ${LAMBDA_FUNCTION_NAME} --s3-bucket ${S3_BUCKET} --s3-key ${ZIP_FILE}"
                    // Update the Lambda function configuration
                    sh "aws lambda update-function-configuration --function-name ${LAMBDA_FUNCTION_NAME} --environment 'LOG_GROUP_NAME=${LOG_GROUP_NAME}' --tracing-config 'Mode=${X_RAY_TRACING}'"
                    // Create the CloudWatch log group if it doesn't exist
                    sh "aws logs create-log-group --log-group-name ${LOG_GROUP_NAME} || echo 'Log group already exists'"
                    // Set the retention policy for the log group
                    sh "aws logs put-retention-policy --log-group-name ${LOG_GROUP_NAME} --retention-in-days 14"
                }
            }
        }

        stage('Monitoring') {
            steps {
                script {
                    // Set up CloudWatch alarms for monitoring
                    sh "aws cloudwatch put-metric-alarm --alarm-name 'HighErrorRate' --metric-name 'Errors' --namespace 'AWS/Lambda' --statistic 'Sum' --period 300 --threshold 1 --comparison-operator 'GreaterThanThreshold' --dimensions 'Name=FunctionName,Value=${LAMBDA_FUNCTION_NAME}' --evaluation-periods 1 --alarm-actions 'arn:aws:sns:us-east-1:123456789012:your-sns-topic'"
                    sh "aws cloudwatch put-metric-alarm --alarm-name 'HighDuration' --metric-name 'Duration' --namespace 'AWS/Lambda' --statistic 'Average' --period 300 --threshold 1000 --comparison-operator 'GreaterThanThreshold' --dimensions 'Name=FunctionName,Value=${LAMBDA_FUNCTION_NAME}' --evaluation-periods 1 --alarm-actions 'arn:aws:sns:us-east-1:123456789012:your-sns-topic'"
                }
            }
        }
    }
}
