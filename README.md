# Projet GraphQl

# Installation

- Cloner le projet
git clone https://github.com/projet_graphql.git
cd projet_graphql

- Installer les dépendances
npm install

- Configurer la base de données
Assurez-vous d'avoir PostgreSQL ou une autre base supportée par Prisma.
Configurez votre fichier .env :
DATABASE_URL="postgresql://user:password@localhost:542/nom_de_la_base"
JWT_SECRET="votre_secret_jwt"

- Générer le schéma Prisma
npx prisma migrate dev --name init

- Démarrer le serveur
npm run dev

# Création utilisateur
mutation CreateUser{
  createUser(username: "testuser", password: "password123") {
    code
    message
    success
    user {
      id
      username
    }
  }
}

# Connextion utilisateur
mutation SignIn{
  signIn(username: "testuser", password: "password123") {
   code
   message
    token
  }
}

# Créer un artcile
mutation CreatePost{
  createPost(title: "Mon premier article", content: "Ceci est le contenu de mon article.") {
    code
    message
    success
    post {
      id
      title
      content
      likesCount
    }
  }
}

# Récuperer tous les articles
query GetAllPost{
  posts {
    id
    title
    content
    likesCount
  }
}

# Récuper l'article par ID
query GetPostByID {
  post(id: "2df23a5e-8112-42bb-8fee-7af2571da481") {
    id
    title
    content
    likesCount
    comments {
      id
      content
    }
  }
}

# Mettre a jour un article
mutation updatePost{
  updatePost(id: "ef3b7a11-4621-4029-a952-bb55b08b35ba", title: "Titre mis à jour", content: "Contenu mis à jour.") {
    code
    message
    success
    post {
      id
      title
      content
    }
  }
}

# Suppression d'un article
mutation deletePost{
  deletePost(id: "ef3b7a11-4621-4029-a952-bb55b08b35ba") {
    code
    message
    success
  }
}

# Ajout commentaire
mutation AddComment{
  addComment(postId: "b11d0958-02b3-4947-8c6b-3d64a9b4308a", content: "Ceci est un commentaire.") {
    code
    message
    success
    comment {
      id
      content
     author {
      username
     }
    }
  }
}

# Suppression d'un commentaire
mutation deleteComment{
  deleteComment(commentId: "8aea14f0-7ec4-4f54-9a50-88c3c5a5ae8d") {
    code
    message
    success
  }
}

# Liké un article
mutation LikePost{
  likePost(postId: "2df23a5e-8112-42bb-8fee-7af2571da481") {
    success
    message
  }
}

# Unlike un article
mutation UnlikePost{
  unlikePost(postId: "eb57e3c6-e6d7-41b4-a054-27dc8eb2218c") {
    success
    message
  }
}

# Récupere les likes d'un article
query GetLikes{
  getLikesPost(postId: "2df23a5e-8112-42bb-8fee-7af2571da481")
}

