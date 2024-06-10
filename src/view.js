import onChange from 'on-change';

const createNewElement = (tag, style = [], content = '') => {
  const element = document.createElement(tag);
  element.classList.add(...style)
  element.textContent = content;
  return element;
};

const makeFeedsContainer = (elements = [], text = '') => {
  const box = document.querySelector('.feeds');
  const cardBorder = createNewElement('div', ['card', 'border-0']);
  const cardBody = createNewElement('div', ['card-body']);
  const cardTitle = createNewElement('h2', ['card-title', 'h4'], text);
  const listGroup = createNewElement('ul', ['list-group', 'border-0', 'rounded-0']);
  listGroup.append(...elements);
  cardBody.append(cardTitle);
  cardBorder.append(cardBody, listGroup);
  box.replaceChildren(cardBorder);
};

//проверка на дурачка
//const listEl = createNewElement('li', ['list-group-item', 'border-0', 'border-end-0'], 'ELEMENT');
//makeFeedsContainer([listEl], 'TEXT');

const makeFeedList = (feeds, text) => {
  const feedsList = feeds.map(({ title, description }) => {
    const elList = createNewElement('li', ['list-group-item', 'border-0', 'border-end-0']);
    const head = createNewElement('h3', ['h6', 'm-0'], title);
    const descr = createNewElement('p', ['m-0', 'small', 'text-black-50'], description);
    return elList.append(head, descr);
  });
  makeFeedsContainer(feedsList, text);
}


const makeSuccesText = (input, p, text) => {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  p.textContent = text; // eslint-disable-next-line no-param-reassign
  p.classList.remove('text-danger');
  p.classList.add('text-success');
};

const makeInvaildText = (input, p, text) => {
  input.classList.remove('is-valid');
  input.classList.add('is-invalid');
  p.classList.remove('text-success');
  p.classList.add('text-danger');
  p.textContent = text; // eslint-disable-next-line no-param-reassign
};

export default (state, i18n) => onChange(state, (path, current) => {
  const paragraph = document.querySelector('.feedback');
  const urlInput = document.querySelector('#url-input');
  const feedsEl = document.querySelector('.feeds');
  const postsEl = document.querySelector('.posts');

  switch (path) {
    case 'form.error':
      makeInvaildText(urlInput, paragraph, i18n.t(current));
      break;

    case 'status':
      //input.value = '';
      //input.focus();
      feedsEl.textContent = '';
      postsEl.textContent = '';
      makeFeedList(state.feeds, i18n.t('titleFeeds'));
      makeSuccesText(urlInput, paragraph, i18n.t('validUrl'));
      break;

    default:
      throw new Error('BOOM!');
  }
});
