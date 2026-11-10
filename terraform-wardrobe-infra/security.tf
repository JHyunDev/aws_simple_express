
resource "aws_security_group" "alb" {
  name        = "wardrobe-alb-sg"
  description = "security group for alb"
  vpc_id      = aws_default_vpc.wardrobe.id

  lifecycle {
    prevent_destroy = true
  }
}


resource "aws_security_group" "ec2_private" {
  name        = "wardrobe-ec2-private-sg"
  description = "Security group for private ec2"
  vpc_id      = aws_default_vpc.wardrobe.id

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_security_group" "rds_private" {
  name        = "wardrobe-rds-private-sg"
  description = "allow access from ec2"
  vpc_id      = aws_default_vpc.wardrobe.id

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_security_group" "eice" {
  name        = "wardrobe-eice-sg"
  description = "sg for EICE"
  vpc_id      = aws_default_vpc.wardrobe.id

  lifecycle {
    prevent_destroy = true
  }
}


resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id

  ip_protocol = "tcp"
  from_port   = 80
  to_port     = 80

  cidr_ipv4 = "0.0.0.0/0"

  lifecycle {
    prevent_destroy = true
  }
}