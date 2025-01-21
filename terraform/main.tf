provider "aws" {
  region = "us-west-2"
}

resource "aws_instance" "app_server" {
  ami           = "ami-example"
  instance_type = "t2.micro"

  tags = {
    Name = "TwitchAppServer"
  }
}

output "instance_ip" {
  value = aws_instance.app_server.public_ip
}
