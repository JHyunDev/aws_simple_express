variable "ec2_key_name" {
  description = "Existing EC2 Key Pair name"
  type        = string
}

variable "db_username"{
  description = "RDS master user name"
  type        = string
}

variable "rds_kms_key_arn" {
  description = "Existing RDS KMS key ARN"
  type        = string
}
