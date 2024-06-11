import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import renderRSS from './view.js';
import getParsedData from './parse.js';

const createUrl = (rssFeed) => {
  const proxy = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
  const proxiedUrl = `${proxy}${rssFeed}`;
  return proxiedUrl;
};

export default async () => {
  yup.setLocale({
    mixed: {
      default: 'default',
      required: 'empty',
      notOneOf: 'alreadyExists',
    },
    string: { url: 'invalidUrl' },
  });

  const state = {
    form: {
      status: '',
      error: '',
    },
    links: [],
    feeds: [],
    posts: [],
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru: {
        translation: {
          titleFeeds: 'Фиды',
          titlePosts: 'Посты',
          validUrl: 'RSS успешно загружен',
          invalidUrl: 'Ссылка должна быть валидным URL',
          empty: 'Не должно быть пустым',
          alreadyExists: 'RSS уже существует',
          noRSS: 'Ресурс не содержит валидный RSS',
          networkError: 'Ошибка сети',
          default: 'Что-то пошло не так',
        },
      },
    },
  });

  const watchedState = renderRSS(state, i18n);

  const errorHandler = (error) => {
    if (error.isAxiosError) {
      watchedState.form.error = i18n.t('networkError');
    } else {
      watchedState.form.error = i18n.t('noRSS');
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
          const updatePosts = [...newPostsWithId, ...watchedState.posts];
          watchedState.posts = updatePosts;
          state.posts = updatePosts;
        }).catch((error) => errorHandler(error)));
      Promise.all(newPromise)
        .finally(() => updateData(feeds));
    }, interval);
  };

  const makeValidateScheme = (links) => {
    const schema = yup.string().notOneOf(links).url();
    return schema;
  };

  const rssForm = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');

  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();

    makeValidateScheme(state.links).validate(input.value)
      .then(() => {
        getHTTPresponseData(input.value).then(() => {
          state.form.error = i18n.t('validUrl');
          state.links.push(input.value);

          watchedState.status = 'loaded';

          watchedState.status = 'feeling';
          updateData(state.feeds);
          console.log(state);
        }).catch((err) => errorHandler(err));
      })
      .catch((error) => {
        const [currentError] = error.errors;
        watchedState.form.error = currentError;
        state.form.error = currentError;
      });
  });
};
