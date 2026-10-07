export async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || '데이터를 불러오지 못했습니다.');
  return data;
}

// 개선 과제 후보: 목록과 상세의 숫자에 천 단위 구분자를 함께 적용해 보세요.
export function formatPrice(price) {
  return `${price} 만원`;
}

export function formatMileage(mileage) {
  return `${mileage} km`;
}

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  // 사용자 입력을 HTML로 해석하지 않고 텍스트로 넣습니다.
  if (text !== undefined) node.textContent = text;
  return node;
}

export function showState(container, title, message, retry) {
  container.replaceChildren(element('h2', '', title), element('p', '', message));
  container.hidden = false;
  if (retry) {
    const button = element('button', 'button button-dark', '다시 불러오기');
    button.type = 'button';
    button.addEventListener('click', retry);
    container.append(button);
  }
}

export function setCarImage(image, car) {
  image.src = /^\/assets\/cars\/[a-z0-9-]+\.svg$/.test(car.image)
    ? car.image : '/assets/cars/sedan-white.svg';
  image.alt = `${car.name} 설명용 일러스트`;
  image.addEventListener('error', () => { image.src = '/assets/cars/sedan-white.svg'; }, { once: true });
}
