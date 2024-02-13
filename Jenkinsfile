pipeline {
    agent any 
    
    stages {
        stage("Build") { 
            steps {
                echo "Building the image"
                sh "sudo docker compose build"
            }
        }
        stage("Down") {
            steps {
                echo "Stopping and removing old containers"
                sh "sudo docker compose down"
            }
        }
        stage("Deploy") {
            steps {
                echo "Deploying the container"
                sh "sudo docker compose up -d"
            }
        }
        
    }
}
