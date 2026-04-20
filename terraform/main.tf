provider "aws" {
  region = "us-east-1" # Updated to match your region
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
