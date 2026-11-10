
resource "aws_instance" "wardrobe_a" {
  ami           = "ami-02fa74e986be90cb5"
  instance_type = "t3.micro"

  subnet_id = aws_subnet.private_a.id

  vpc_security_group_ids = [
    aws_security_group.ec2_private.id
  ]

  associate_public_ip_address = false

  iam_instance_profile = "WardrobeEC2S3UploadRole"
  key_name             = var.ec2_key_name

  monitoring    = false
  ebs_optimized = true

  instance_initiated_shutdown_behavior = "stop"

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    iops                  = 3000
    throughput            = 125
    encrypted             = false
    delete_on_termination = true
  }

  credit_specification {
    cpu_credits = "standard"
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  tags = {
    Name = "wardrobe-private-ec2-northeast-2a"
  }

  lifecycle {
    prevent_destroy = true
  }
}


resource "aws_instance" "wardrobe_b" {
  ami           = "ami-02fa74e986be90cb5"
  instance_type = "t3.micro"

  subnet_id = aws_subnet.private_b.id

  vpc_security_group_ids = [
    aws_security_group.ec2_private.id
  ]

  associate_public_ip_address = false

  iam_instance_profile = "WardrobeEC2S3UploadRole"
  key_name             = var.ec2_key_name

  monitoring    = false
  ebs_optimized = true

  instance_initiated_shutdown_behavior = "stop"

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    iops                  = 3000
    throughput            = 125
    encrypted             = false
    delete_on_termination = true
  }

  credit_specification {
    cpu_credits = "standard"
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  tags = {
    Name = "wardrobe-private-ec2-northeast-2b"
  }

  lifecycle {
    prevent_destroy = true
  }
}