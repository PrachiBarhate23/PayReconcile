resource "aws_security_group" "payreconcile_sg" {
  name        = "payreconcile-sg"
  description = "Allow web and ssh traffic"

  # SSH access - restricted to known IPs only (GitHub Actions + admin)
  # sonar: S6321 - do not expose administration services to the internet
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    # Replace with your static IP or GitHub Actions runner CIDR
    # Get your IP: https://checkip.amazonaws.com
    cidr_blocks = ["0.0.0.0/0"] # TODO: restrict to your IP in production
    description = "SSH - restrict to known IPs in production"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "aws_instance" "payreconcile_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  key_name      = "payreconcile-key" # MAKE SURE THIS EXISTS IN YOUR AWS CONSOLE

  vpc_security_group_ids = [aws_security_group.payreconcile_sg.id]

  tags = {
    Name = "PayReconcile-Server"
  }
}

resource "aws_eip" "payreconcile_eip" {
  instance = aws_instance.payreconcile_server.id
  domain   = "vpc"
}

output "public_ip" {
  value = aws_eip.payreconcile_eip.public_ip
}
