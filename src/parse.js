export default (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/xml');
  // console.log(doc);
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.message = 'invalidRSS';
    error.isParsingError = true;
    throw error;
  }
  const root = doc.querySelector('channel');
  const feedTitle = root.querySelector('title').textContent;
  const feedDescription = root.querySelector('description').textContent;
  const items = Array.from(root.querySelectorAll('item'));
  const newPosts = items.map((item) => {
    const titlePost = item.querySelector('title').textContent;
    const descriptionPost = item.querySelector('description').textContent;
    return { titlePost, descriptionPost };
  });
  return { feeds: [{ title: feedTitle, description: feedDescription }], posts: newPosts };
};
