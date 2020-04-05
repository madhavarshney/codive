import { absolutify } from './absolutify';

const RANDOM_SPLITTER = 'codive83d';

const extractSlides = (data) => {
  let parts = data
    .replace(/\<h(1|2)\>/gi, `${RANDOM_SPLITTER}<h$1>`)
    .split(RANDOM_SPLITTER);
  // TODO: clean extra stuff from last part as well
  parts.shift();

  // Split by <h1> and <h2> tags
  let skipNext = false;
  parts = parts.reduce((acc, currentValue, i, array) => {
    let trimmed = currentValue.trim();
    if (skipNext) {
      if (trimmed.search(/\<\/h(1|2)\>/gi) === trimmed.length - 5) {
        acc.push(acc.pop() + currentValue + array[i + 1]);
        skipNext = true;
      } else {
        skipNext = false;
      }
    } else {
      if (trimmed.search(/\<\/h(1|2)\>/gi) === trimmed.length - 5) {
        acc.push(currentValue + array[i + 1]);
        skipNext = true;
      } else {
        acc.push(currentValue);
      }
    }
    return acc;
  }, []);

  return parts;
};

export const fetchAllSlides = (metadata) =>
  new Promise((resolve, reject) => {
    const { repo, branch, file, path } = metadata;
    const slideUrl = `https://api.github.com/repos/${repo}/contents/${path}/${file}?ref=${branch}`;
    const contentUrl = `https://github.com/${repo}/raw/${branch}/${path}`;
    const cachedData = localStorage.getItem('fetch' + slideUrl);

    const request = cachedData
      ? Promise.resolve(cachedData)
      : fetch(slideUrl, {
          method: 'GET',
          // cache: 'no-cache',
          headers: {
            Accept: 'application/vnd.github.v3.html+json',
          },
        })
          .then((response) => response.text())
          // .then(response => response.json())
          .catch((err) => console.error(err));

    request
      .then((data) => {
        // TODO: fix
        if (!data) {
          throw new Error('data is undefined!');
        }
        localStorage.setItem('fetch' + slideUrl, data);
        // let slideContent = atob(data.content);
        // data = md.render(slideContent);
        const slides = extractSlides(data);
        resolve(slides.map((slide) => absolutify(slide, contentUrl)));
      })
      .catch((err) => console.error(err));
  });
