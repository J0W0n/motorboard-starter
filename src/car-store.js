import { readFile } from 'node:fs/promises';

const carsFile = new URL('../data/cars.json', import.meta.url);

// 요청마다 파일을 읽습니다. JSON 수정 후 서버를 다시 시작하지 않아도 반영됩니다.
export async function getCars() {
  const contents = await readFile(carsFile, 'utf8');
  const cars = JSON.parse(contents.replace(/^\uFEFF/, ''));
  if (!Array.isArray(cars)) throw new Error('cars.json의 최상위 값은 배열이어야 합니다.');
  return cars;
}

export async function getCarById(id) {
  const cars = await getCars();
  return cars.find((car) => car.id === id) ?? null;
}

// 실습: 입력값 검증과 중복 없는 ID 생성을 거쳐 차량을 파일에 저장하는 함수를 추가하세요.
