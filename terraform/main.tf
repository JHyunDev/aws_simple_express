data "aws_vpc" "wardrobe" {
  default = true
}

output "wardrobe_vpc_id" {
  value = data.aws_vpc.wardrobe.id
}

output "wardrobe_vpc_cidr" {
  value = data.aws_vpc.wardrobe.cidr_block
}