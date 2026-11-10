
resource "aws_lb" "wardrobe" {
  name               = "wardrobe-public-alb"
  internal           = false
  load_balancer_type = "application"
  ip_address_type    = "ipv4"

  subnets = [
    aws_subnet.public_a.id,
    aws_subnet.public_b.id
  ]

  security_groups = [
    aws_security_group.alb.id
  ]

  # 기존 ALB 설정 유지
  idle_timeout                     = 60
  client_keep_alive                = 3600
  enable_http2                     = true
  enable_cross_zone_load_balancing = true
  enable_deletion_protection       = false

  desync_mitigation_mode           = "defensive"
  drop_invalid_header_fields      = false
  preserve_host_header            = false
  xff_header_processing_mode      = "append"
  enable_waf_fail_open             = false

  access_logs {
    bucket  = "wardorbe-alb-access-logs-s3-066036524900-ap-northeast-2-an"
    prefix  = "alb-logs"
    enabled = true
  }

  tags = {}

  lifecycle {
    prevent_destroy = true
  }
}


resource "aws_lb_target_group" "wardrobe" {
  name        = "wardrobe-alb-targetgroup"
  port        = 3000
  protocol    = "HTTP"
  protocol_version = "HTTP1"
  target_type = "instance"
  vpc_id      = aws_default_vpc.wardrobe.id
  ip_address_type = "ipv4"

  health_check {
    enabled             = true
    protocol            = "HTTP"
    port                = "traffic-port"
    path                = "/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 5
    unhealthy_threshold = 2
    matcher             = "200"
  }

  deregistration_delay = 300

  load_balancing_algorithm_type = "round_robin"
  slow_start                    = 0

  stickiness {
    type            = "lb_cookie"
    enabled         = false
    cookie_duration = 86400
  }

  tags = {}

  lifecycle {
    prevent_destroy = true
  }
}


resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.wardrobe.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.wardrobe.arn

    forward {
      target_group {
        arn    = aws_lb_target_group.wardrobe.arn
        weight = 1
      }

      stickiness {
        enabled  = false
        duration = 3600
      }
    }
  }

  tags = {}

  lifecycle {
    prevent_destroy = true
  }
}