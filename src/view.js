import onChange from 'on-change';

const displayInitialization = (elements, i18n) => {
  elements.init.readCompletelyEl.textContent = i18n.t('elsInit.readCompletely');
  elements.init.close.textContent = i18n.t('elsInit.close');
  elements.init.projectTitle.textContent = i18n.t('elsInit.projectTitle');
  elements.init.startRead.textContent = i18n.t('elsInit.startRead');
  elements.init.labelRss.textContent = i18n.t('elsInit.placeholder');
  elements.init.addButton.textContent = i18n.t('elsInit.add');
  elements.init.exampleRss.textContent = i18n.t('elsInit.exampleRss');
  elements.init.createdBy.textContent = i18n.t('elsInit.createdBy');
  const createdLink = document.createElement('a');
  createdLink.setAttribute('href', i18n.t('elsInit.createdLink'));
  createdLink.setAttribute('tagret', '_blank');
  createdLink.textContent = i18n.t('elsInit.createdName');
  elements.init.createdBy.append(createdLink);
};

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

const makePostsContainer = (watched, elements = [], text = '') => {
  const postList = elements.map((post) => {
    const el = createNewElement('li', ['list-group-item', 'd-flex',
      'justify-content-between', 'align-items-start',
      'border-0', 'border-end-0']);
    let link = '';
    if (watched.has(post)) {
      link = createNewElement('a', ['fw-normal', 'link-secondary']);
    } else {
      link = createNewElement('a', ['fw-bold']);
    }
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

const makeModal = (elements, value) => {
  elements.modal.title.textContent = value.titlePost;
  elements.modal.body.textContent = value.descriptionPost;
  elements.modal.buttonLink.setAttribute('href', value.linkPost);
};

const changeStylePost = (ids) => {
  ids.map((id) => {
    const link = document.querySelector(`[data-id='${id}']`);
    link.classList.remove('fw-bold');
    link.classList.add('fw-normal', 'link-secondary');
    return link;
  });
};

const makeSuccesText = (elements, text) => {
  elements.urlInput.classList.remove('is-invalid');
  elements.urlInput.classList.add('is-valid');
  elements.feedback.textContent = text;
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
};

const makeInvaildText = (elements, text) => {
  elements.urlInput.classList.remove('is-valid');
  elements.urlInput.classList.add('is-invalid');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  elements.feedback.textContent = text;
};

export default (state, elements, i18n) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.error':
      console.log(value);
      makeInvaildText(elements, i18n.t(`errors.${value}`));
      break;
    case 'process':
      if (value === 'init') {
        displayInitialization(elements, i18n);
      }
      break;
    case 'status':
      elements.feeds.textContent = '';
      elements.posts.textContent = '';
      makeFeedList(state.feeds, i18n.t('titleFeeds'));
      makePostsContainer(state.watchedPosts, state.posts, i18n.t('titlePosts'));
      makeSuccesText(elements, i18n.t('validUrl'));
      break;
    case 'posts':
      makePostsContainer(state.watchedPosts, state.posts, i18n.t('titlePosts'));
      break;
    case 'feeds':
      break;
    case 'action':
      makeModal(elements, value);
      break;
    case 'opened':
      changeStylePost(value);
      break;
    case 'watchedPosts':
      break;
    default:
      throw new Error('BOOM!');
  }
});
