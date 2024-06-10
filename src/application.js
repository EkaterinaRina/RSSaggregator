import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import renderRSS from './view.js';
import _ from 'lodash';
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

  const getHTTPresponseData = (url) => axios.get(createUrl(url))
    .then((response) => {
      const parsedData = getParsedData(response.data);
      const feedsWithUrl = parsedData.feeds.map((feed) => ({ link: url, ...feed }));
      state.feeds = [...feedsWithUrl, ...state.feeds];
      const initial = parsedData.posts.map((item) => ({ id: _.uniqueId(), ...item }));
      state.posts = [...initial, ...state.posts];
      return { response: response.status };
    })
    .catch(() => new Error('networkError'));

  const makeValidateScheme = (links) => {
    const schema = yup.string().notOneOf(links).url();
    return schema;
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

  const rssForm = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');

  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();

    makeValidateScheme(state.links).validate(input.value)
      .then(() => {
        getHTTPresponseData(input.value).then(() => {
          state.form.error = i18n.t('validUrl');
          state.links.push(input.value);
          console.log(state);
          watchedState.status = 'loaded';
          watchedState.status = 'feeling';
        }).catch(() => {
          watchedState.form.error = i18n.t('noRSS');
        })
      })

      .catch((error) => {
        const [currentError] = error.errors;
        watchedState.form.error = currentError;
        state.form.error = currentError;
        console.log(state.form.error);
      });
  });
};
