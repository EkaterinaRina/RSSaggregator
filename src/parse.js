export default (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    return new Error('noRSS');
  }
  const root = doc.querySelector('channel');
  const feedTitle = root.querySelector('title').textContent;
  const feedDescription = root.querySelector('description').textContent;
  const items = Array.from(root.querySelectorAll('item'));
  const newPosts = items.map((item) => {
    const titlePost = item.querySelector('title').textContent;
    const descriptionPost = item.querySelector('description').textContent;
    const linkPost = item.querySelector('link').textContent;
    return { titlePost, descriptionPost, linkPost };
  });
  return { feeds: { title: feedTitle, description: feedDescription }, posts: newPosts };
};
