resource "aws_db_subnet_group" "wardrobe" {
  description = "private"
  name        = "private-db-group-wardrobe"
  region      = "ap-northeast-2"
  subnet_ids  = [
                  aws_subnet.private_a.id, 
                  aws_subnet.private_b.id]
  tags        = {}
  tags_all    = {}

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_db_instance" "wardrobe" {
  allocated_storage                     = 20
  allow_major_version_upgrade           = null
  apply_immediately                     = null
  auto_minor_version_upgrade            = true
  availability_zone                     = "ap-northeast-2a"
  backup_retention_period               = 1
  backup_target                         = "region"
  backup_window                         = "15:50-16:20"
  ca_cert_identifier                    = "rds-ca-rsa2048-g1"
  copy_tags_to_snapshot                 = true
  custom_iam_instance_profile           = null
  customer_owned_ip_enabled             = false
  database_insights_mode                = "standard"
  db_subnet_group_name                  = aws_db_subnet_group.wardrobe.name
  dedicated_log_volume                  = false
  delete_automated_backups              = true
  deletion_protection                   = false
  domain                                = null
  domain_auth_secret_arn                = null
  domain_iam_role_name                  = null
  domain_ou                             = null
  enabled_cloudwatch_logs_exports       = []
  engine                                = "mysql"
  engine_lifecycle_support              = "open-source-rds-extended-support-disabled"
  engine_version                        = "8.4.8"
  final_snapshot_identifier             = null
  iam_database_authentication_enabled   = false
  identifier                            = "wardrobe-rds-private"
  instance_class                        = "db.t3.micro"
  iops                                  = 0
  kms_key_id                            = var.rds_kms_key_arn
  license_model                         = "general-public-license"
  maintenance_window                    = "sat:18:40-sat:19:10"
  manage_master_user_password           = null
  max_allocated_storage                 = 1000
  monitoring_interval                   = 0
  multi_az                              = false
  network_type                          = "IPV4"
  option_group_name                     = "default:mysql-8-4"
  parameter_group_name                  = "default.mysql8.4"
  password                              = null # sensitive
  password_wo                           = null # sensitive
  password_wo_version                   = null
  performance_insights_enabled          = false
  performance_insights_retention_period = 0
  port                                  = 3306
  publicly_accessible                   = false
  region                                = "ap-northeast-2"
  replicate_source_db                   = null
  skip_final_snapshot                   = true
  storage_encrypted                     = true
  storage_throughput                    = 0
  storage_type                          = "gp2"
  tags                                  = {}
  tags_all                              = {}
  upgrade_storage_config                = null
  username                              = var.db_username
  vpc_security_group_ids = [
  aws_security_group.rds_private.id
]
  warning_event_categories              = null

  lifecycle {
  prevent_destroy = true
  }
}
