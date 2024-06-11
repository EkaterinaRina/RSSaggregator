import onChange from 'on-change';

const createNewElement = (tag, style = [], content = '') => {
  const element = document.createElement(tag);
  element.classList.add(...style);
  element.textContent = content;
  return element;
};

const makeContainer = (box, elements = [], text = '') => {
  const cardBorder = createNewElement('div', ['card', 'border-0']);
  const cardBody = createNewElement('div', ['card-body']);
  const cardTitle = createNewElement('h2', ['card-title', 'h4'], text);
  const listGroup = createNewElement('ul', ['list-group', 'border-0', 'rounded-0']);
  listGroup.append(...elements);
  cardBody.append(cardTitle);
  cardBorder.append(cardBody, listGroup);
  box.replaceChildren(cardBorder);
};

const makeFeedList = (feeds, text) => {
  const feedsList = feeds.flat();
  const feedsMap = feedsList.map(({ title, description }) => {
    const elList = createNewElement('li', ['list-group-item', 'border-0', 'border-end-0']);
    const head = createNewElement('h3', ['h6', 'm-0'], title);
    const descr = createNewElement('p', ['m-0', 'small', 'text-black-50'], description);
    elList.append(head, descr);
    return elList;
  });

  const box = document.querySelector('.feeds');
  makeContainer(box, feedsMap, text);
};

const makePostsContainer = (elements = [], text = '') => {
  const postList = elements.map((post) => {
    const el = createNewElement('li', ['list-group-item', 'd-flex',
      'justify-content-between', 'align-items-start',
      'border-0', 'border-end-0']);
    const link = createNewElement('a', ['fw-bold']);
    link.setAttribute('data-id', post.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('href', post.linkPost);
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.titlePost;

    const button = createNewElement('button', ['btn', 'btn-outline-primary', 'btn-sm']);
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = 'Просмотр';

    el.append(link, button);
    return el;
  });
  const box = document.querySelector('.posts');
  makeContainer(box, postList, text);
};

const makeSuccesText = (input, p, text) => {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  p.textContent = text; //  eslint-disable-next-line no-param-reassign
  p.classList.remove('text-danger');
  p.classList.add('text-success');
};

const makeInvaildText = (input, p, text) => {
  input.classList.remove('is-valid');
  input.classList.add('is-invalid');
  p.classList.remove('text-success');
  p.classList.add('text-danger');
  p.textContent = text; //  eslint-disable-next-line no-param-reassign
};

export default (state, i18n) => onChange(state, (path, value) => {
  const paragraph = document.querySelector('.feedback');
  const urlInput = document.querySelector('#url-input');
  const feedsEl = document.querySelector('.feeds');
  const postsEl = document.querySelector('.posts');

  switch (path) {
    case 'form.error':
      console.log(value);
      makeInvaildText(urlInput, paragraph, i18n.t(value));
      break;

    case 'status':
      //  input.value = '';
      //  input.focus();
      feedsEl.textContent = '';
      postsEl.textContent = '';
      makeFeedList(state.feeds, i18n.t('titleFeeds'));
      makePostsContainer(state.posts, i18n.t('titlePosts'));
      makeSuccesText(urlInput, paragraph, i18n.t('validUrl'));
      break;
    case 'posts':
      makePostsContainer(state.posts, i18n.t('titlePosts'));
      break;
    case 'feeds':
      break;
    default:
      throw new Error('BOOM!');
  }
});
