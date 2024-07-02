import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import view from './view.js';
import getParsedData from './parse.js';
import resources from '../locales/index.js';

const createUrl = (rssFeed) => {
  const proxy = 'https://allorigins.hexlet.app/get';
  const proxiedUrl = new URL(proxy);
  proxiedUrl.searchParams.set('disableCache', 'true');
  proxiedUrl.searchParams.set('url', rssFeed);
  return proxiedUrl;
};

export default async () => {
  const elements = {
    init: {
      readCompletelyEl: document.querySelector('.full-article'),
      close: document.querySelector('.modal-footer > button'),
      projectTitle: document.querySelector('h1'),
      startRead: document.querySelector('.lead'),
      labelRss: document.querySelector('label[for="url-input"]'),
      addButton: document.querySelector('button[type="submit"]'),
      exampleRss: document.querySelector('.text-white-50'),
      createdBy: document.querySelector('.text-center'),
    },
    form: document.querySelector('.rss-form'),
    urlInput: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    exampleUrl: document.querySelector('.example-url'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: {
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      buttonLink: document.querySelector('.full-article'),
    },
  };

  yup.setLocale({
    mixed: {
      default: 'default',
      required: 'empty',
      notOneOf: 'alreadyExists',
    },
    string: { url: 'invalidUrl' },
  });

  const state = {
    process: '',
    form: {
      status: '',
      error: '',
    },
    action: {
      link: '',
      title: '',
      descr: '',
    },
    links: [],
    feeds: [],
    posts: [],
    opened: [],
    watchedPosts: new Set(),
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: true,
    resources,
  });

  const watchedState = view(state, elements, i18n);
  watchedState.process = 'init';

  const errorHandler = (error) => {
    if (error.isAxiosError) {
      watchedState.form.error = i18n.t('errors.networkError');
    } else {
      watchedState.form.error = i18n.t('errors.noRSS');
    }
  };

  const getHTTPresponseData = (url) => axios.get(createUrl(url))
    .then((response) => {
      const parsedData = getParsedData(response.data.contents);
      const feedsWithUrl = parsedData.feeds.map((feed) => ({ link: url, ...feed }));
      const initial = parsedData.posts.map((item) => ({ id: _.uniqueId(), ...item }));
      watchedState.feeds = [...watchedState.feeds, feedsWithUrl];
      watchedState.posts = [...watchedState.posts, ...initial];
    });
  //  .catch(() => new Error('networkError'));

  const updateData = (feeds, interval = 5000) => {
    setTimeout(() => {
      const newPromise = feeds.flat().map((feed) => axios.get(createUrl(feed.link))
        .then((response) => {
          const newPosts = getParsedData(response.data.contents).posts;
          const oldTitles = new Set(watchedState.posts.map((post) => post.titlePost));
          const filteredNewPost = newPosts.filter((post) => !oldTitles.has(post.titlePost));
          const newPostsWithId = filteredNewPost.map((post) => ({ id: _.uniqueId(), ...post }));
          newPostsWithId.map((post) => watchedState.posts.unshift(post));
        }).catch((error) => errorHandler(error)));

      Promise.all(newPromise)
        .finally(() => updateData(feeds));
    }, interval);
  };

  const makeValidateScheme = (links) => {
    const schema = yup.string().notOneOf(links).url();
    return schema;
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    makeValidateScheme(state.links).validate(elements.urlInput.value)
      .then(() => {
        getHTTPresponseData(elements.urlInput.value).then(() => {
          state.form.error = i18n.t('validUrl');
          state.links.push(elements.urlInput.value);
          watchedState.status = 'loaded';
          watchedState.status = 'feeling';
          updateData(watchedState.feeds);
          e.target.reset();
          elements.urlInput.focus();
        }).catch((err) => errorHandler(err));
      })
      .catch((error) => {
        const [currentError] = error.errors;
        watchedState.form.error = currentError;
        state.form.error = currentError;
      });
  });

  elements.posts.addEventListener('click', (e) => {
    if (e.target.dataset.id) {
      const activePostId = e.target.dataset.id;
      const activePost = watchedState.posts.filter((post) => post.id === activePostId)[0];
      const {
        id,
        titlePost,
        descriptionPost,
        linkPost,
      } = activePost;
      watchedState.action = {
        linkPost,
        titlePost,
        descriptionPost,
      };
      watchedState.opened.push(id);
      watchedState.watchedPosts.add(activePost);
    }
  });
};
