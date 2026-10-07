import { fetchJson, formatPrice, formatMileage, element, showState, setCarImage } from './shared.js';

const status = document.querySelector('#detail-status');
const detail = document.querySelector('#car-detail');
const id = new URLSearchParams(location.search).get('id');
const setText = (selector, text) => { document.querySelector(selector).textContent = text; };

function renderCar(car) {
  document.title = `${car.name} — 모터보드`;
  setText('#detail-category', `${car.brand} / ${car.bodyType}`);
  setText('#detail-title', car.name);
  setText('#detail-trim', car.trim);
  setText('#detail-reference', `매물번호 ${car.id}`);
  setCarImage(document.querySelector('#detail-image'), car);
  setText('#detail-price', formatPrice(car.price));
  const specs = [
    ['연식', `${car.year}년`], ['주행거리', formatMileage(car.mileage)],
    ['연료', car.fuel], ['변속기', car.transmission],
    ['차종', car.bodyType], ['색상', car.color],
    ['거래 지역', car.region], ['등록일', car.createdAt.replaceAll('-', '.')],
  ];
  document.querySelector('#spec-list').replaceChildren(...specs.map(([label, value]) => {
    const item = element('div');
    item.append(element('dt', '', label), element('dd', '', value));
    return item;
  }));
  setText('#detail-description', car.description);
  document.querySelector('#option-list').replaceChildren(...car.options.map(option => element('li', '', option)));
  setText('#seller-name', car.seller.name);
  setText('#seller-region', car.region);
  setText('#seller-phone', car.seller.phone);
  setText('#seller-email', car.seller.email);
  setText('#listed-date', car.createdAt.replaceAll('-', '.'));
}

async function loadCar() {
  if (!id || !/^[a-zA-Z0-9-]+$/.test(id)) {
    showState(status, '차량을 선택해 주세요', '전체 차량으로 돌아가 확인할 차량을 선택해 주세요.');
    return;
  }
  detail.hidden = true;
  showState(status, '차량을 불러오고 있어요', '잠시만 기다려 주세요.');
  try {
    const { car } = await fetchJson(`/api/cars/${encodeURIComponent(id)}`);
    renderCar(car);
    status.hidden = true;
    detail.hidden = false;
  } catch (error) {
    showState(status, '차량 정보를 확인할 수 없어요', error.message, loadCar);
  }
}

loadCar();
