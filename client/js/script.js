async function getPosts() {
    return fetch('/api/posts/get')
        .then(response => response.json())
        .then(data => data)
}

const root = document.getElementById('root');

async function renderPosts() {
    const posts = await getPosts();

    console.log(posts)

    posts.forEach(p => {
        const post = document.createElement('div');
        post.id = p.id

        const title = document.createElement('h2');
        title.innerText = p.title;

        const description = document.createElement('div');
        description.innerHTML = p.description;

        const thumbnail = document.createElement('img');
        thumbnail.src = p.thumbnail;

        post.appendChild(thumbnail);
        post.appendChild(title);
        post.appendChild(description);


        root.appendChild(post);
    })
}

renderPosts()