resource "aws_default_vpc" "wardrobe" {
  enable_dns_hostnames = true
  enable_dns_support   = true

  force_destroy = false

  lifecycle {
    prevent_destroy = true
  }
}


resource "aws_subnet" "public_a" {
  vpc_id                  = aws_default_vpc.wardrobe.id
  cidr_block              = "172.31.64.0/24"
  availability_zone       = "ap-northeast-2a"
  map_public_ip_on_launch = false

  tags = {
    Name = "public-subnet-a"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_subnet" "private_a" {
  vpc_id                  = aws_default_vpc.wardrobe.id
  cidr_block              = "172.31.65.0/24"
  availability_zone       = "ap-northeast-2a"
  map_public_ip_on_launch = false

  tags = {
    Name = "private-subnet-a"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_default_vpc.wardrobe.id
  cidr_block              = "172.31.66.0/24"
  availability_zone       = "ap-northeast-2b"
  map_public_ip_on_launch = false

  tags = {
    Name = "public-subnet-b"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_subnet" "private_b" {
  vpc_id                  = aws_default_vpc.wardrobe.id
  cidr_block              = "172.31.67.0/24"
  availability_zone       = "ap-northeast-2b"
  map_public_ip_on_launch = false

  tags = {
    Name = "private-subnet-b"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_default_vpc.wardrobe.id

  tags = {
    Name = "private-rt"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_route_table_association" "private_a" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private.id

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_route_table_association" "private_b"{
  subnet_id      = aws_subnet.private_b.id
  route_table_id = aws_route_table.private.id

  lifecycle{
    prevent_destroy = true
  }
}

resource "aws_route_table" "main"{
  vpc_id = aws_default_vpc.wardrobe.id

  lifecycle{
    prevent_destroy = true
  }
}

resource "aws_internet_gateway" "wardrobe"{
  vpc_id = aws_default_vpc.wardrobe.id

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_default_vpc.wardrobe.id
  service_name      = "com.amazonaws.ap-northeast-2.s3"
  vpc_endpoint_type = "Gateway"

  route_table_ids = [
    aws_route_table.private.id
  ]

  tags = {
    Name = "wardrobe-ec2-s3-endpoint"
  }

  lifecycle {
    prevent_destroy = true
  }
}


resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  security_group_id = aws_security_group.alb.id
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
  cidr_ipv4         = "0.0.0.0/0"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_vpc_security_group_egress_rule" "alb_egress" {
  security_group_id = aws_security_group.alb.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "ec2_from_alb" {
  security_group_id            = aws_security_group.ec2_private.id
  referenced_security_group_id = aws_security_group.alb.id
  ip_protocol                  = "tcp"
  from_port                    = 3000
  to_port                      = 3000

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "ec2_from_eice" {
  security_group_id            = aws_security_group.ec2_private.id
  referenced_security_group_id = aws_security_group.eice.id
  ip_protocol                  = "tcp"
  from_port                    = 22
  to_port                      = 22

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_vpc_security_group_egress_rule" "ec2_egress" {
  security_group_id = aws_security_group.ec2_private.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_ec2" {
  security_group_id            = aws_security_group.rds_private.id
  referenced_security_group_id = aws_security_group.ec2_private.id
  ip_protocol                  = "tcp"
  from_port                    = 3306
  to_port                      = 3306

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_vpc_security_group_egress_rule" "rds_egress" {
  security_group_id = aws_security_group.rds_private.id
  ip_protocol       = "tcp"
  from_port         = 0
  to_port           = 0
  cidr_ipv4         = "0.0.0.0/0"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_vpc_security_group_egress_rule" "eice_to_ec2" {
  security_group_id            = aws_security_group.eice.id
  referenced_security_group_id = aws_security_group.ec2_private.id
  ip_protocol                  = "tcp"
  from_port                    = 22
  to_port                      = 22

  lifecycle {
    prevent_destroy = true
  }
}
