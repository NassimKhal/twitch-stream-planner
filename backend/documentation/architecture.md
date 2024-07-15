# Architecture du Projet

## Infrastructure

### AWS

- **VPC** : Un Virtual Private Cloud pour isoler les ressources.
- **Amazon EKS** : Un cluster Kubernetes géré pour l'orchestration des conteneurs.
- **Amazon RDS** : Base de données MySQL gérée.
- **AWS S3** : Stockage d'objets pour les sauvegardes.

### Conteneurisation

- **Docker** : Utilisé pour conteneuriser l'application Flask.
- **Kubernetes** : Utilisé pour orchestrer les conteneurs avec Amazon EKS.

### Proxy Inverse

- **NGINX** : Utilisé comme proxy inverse pour diriger le trafic vers l'application Flask.

## Fichiers de Configuration

### Terraform

- **main.tf** : Déploie l'infrastructure AWS (VPC, EKS, RDS, EC2, S3).
- **variables.tf** : Définit les variables pour Terraform.
- **outputs.tf** : Définit les outputs de Terraform.
- **modules/** : Contient les sous-modules pour les différentes ressources AWS (EC2, RDS, S3, EKS, VPC).

### Kubernetes

- **flask-deployment.yaml** : Déploiement pour l'application Flask.
- **flask-service.yaml** : Service pour l'application Flask.
- **nginx-deployment.yaml** : Déploiement pour NGINX.
- **nginx-service.yaml** : Service pour NGINX.
- **nginx-configmap.yaml** : ConfigMap pour la configuration de NGINX.

## Déploiement Continu

### Github Actions

- **main.yml** : Workflow pour déployer l'infrastructure et l'application.

## Sécurité

### IAM

- **IAM Roles** : Rôles IAM pour les services AWS afin de restreindre les permissions et sécuriser les accès.

### SSL/TLS

- **Certificats SSL** : Certificats SSL pour sécuriser les communications HTTP entre les utilisateurs et les services.

## Sauvegardes

### Sauvegardes Automatisées

- **AWS S3** : Utilisé pour stocker les sauvegardes de la base de données et autres fichiers critiques.

### Sauvegardes Manuelles

- **Scripts de Sauvegarde** : Scripts pour effectuer des sauvegardes manuelles et les stocker dans AWS S3.

