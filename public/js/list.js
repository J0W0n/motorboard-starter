import { fetchJson, formatPrice, formatMileage, element, showState, setCarImage } from './shared.js';

const grid = document.querySelector('#car-grid');
const status = document.querySelector('#list-status');
const count = document.querySelector('#car-count');

function createCarCard(car) {
  const article = element('article', 'car-card');
  const link = element('a', 'card-link');
  link.href = `/car.html?id=${encodeURIComponent(car.id)}`;
  link.setAttribute('aria-label', `${car.name}, ${formatPrice(car.price)}, 상세 보기`);

  const visual = element('div', 'card-visual');
  const image = document.createElement('img');
  setCarImage(image, car);
  image.loading = 'lazy';
  image.width = 640;
  image.height = 400;
  visual.append(image, element('span', 'body-badge', car.bodyType));

  const body = element('div', 'card-body');
  const meta = element('div', 'card-meta');
  meta.append(element('span', '', car.brand), element('span', '', car.fuel));
  body.append(meta, element('h3', 'card-title', car.name), element('p', 'card-trim', car.trim));
  const specs = element('p', 'card-specs', `${car.year}년 · ${formatMileage(car.mileage)} · ${car.transmission}`);
  const bottom = element('div', 'card-bottom');
  bottom.append(element('strong', 'card-price', formatPrice(car.price)), element('span', 'card-region', car.region));
  body.append(specs, bottom);
  link.append(visual, body);
  article.append(link);
  return article;
}

async function loadCars() {
  grid.hidden = true;
  showState(status, '차량을 불러오고 있어요', '잠시만 기다려 주세요.');
  try {
    const { cars } = await fetchJson('/api/cars');
    count.textContent = String(cars.length).padStart(2, '0');
    grid.replaceChildren(...cars.map(createCarCard));
    if (!cars.length) {
      showState(status, '아직 등록된 차량이 없어요', '새로운 차량이 등록되면 이곳에서 확인할 수 있어요.');
      return;
    }
    status.hidden = true;
    grid.hidden = false;
  } catch (error) {
    count.textContent = '—';
    showState(status, '차량을 불러오지 못했어요', `${error.message} 서버가 실행 중인지 확인해 주세요.`, loadCars);
  }
}

loadCars();
