import onChange from 'on-change';

const makeSuccesText = (input, p, text) => {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    p.textContent = text;
    p.classList.remove('text-danger');
    p.classList.add('text-success');
};

const makeInvaildText = (input, p, text) => {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    p.classList.remove('text-success');
    p.classList.add('text-danger');
    p.textContent = text;
};

export default (state, i18n) => onChange(state, (path, current) => {
    const paragraph = document.querySelector('.feedback');
    const urlInput = document.querySelector('#url-input');

    switch (path) {
        case 'form.error':
            makeInvaildText(urlInput, paragraph, i18n.t(current));
            break;

        case 'status':
            makeSuccesText(urlInput, paragraph, i18n.t('validUrl'));
            break;

        default:
            throw new Error('BOOM!');
    }
});