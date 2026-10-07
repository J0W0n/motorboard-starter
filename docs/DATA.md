# 차량 데이터 형식

`data/cars.json`의 최상위 값은 차량 객체의 배열입니다. 가격 단위는 **만원**, 주행거리는 **km**입니다.
숫자는 쉼표나 단위가 없는 숫자로 저장하고, 화면에서 표시 형식을 바꿉니다.

```json
{
  "id": "MB-001",
  "brand": "현대",
  "name": "아반떼",
  "trim": "1.6 가솔린 인스퍼레이션",
  "year": 2022,
  "price": 1820,
  "mileage": 32400,
  "fuel": "가솔린",
  "transmission": "자동",
  "bodyType": "세단",
  "color": "화이트",
  "region": "서울 마포구",
  "image": "/assets/cars/sedan-white.svg",
  "description": "학습용 가상 차량 설명입니다.",
  "options": ["후방 카메라", "열선 시트"],
  "createdAt": "2026-09-28",
  "seller": {
    "name": "샘플 판매자 01",
    "phone": "010-XXXX-1001",
    "email": "seller1@example.com"
  }
}
```

등록 과제에서는 기존 상세 화면이 사용하는 필드를 빠뜨리지 않도록 합니다.

- `id`: 서버에서 생성한 고유 문자열. 영문·숫자·하이픈 사용 (UUID 가능).
- `brand`, `name`, `region`, `description`: 앞뒤 공백을 제거한 문자열. 빈 필수값 거절.
- `year`: 정수 연도. 허용 범위는 팀에서 정해 서버에서도 검사.
- `price`: 만원 단위의 양수. 화면의 원 단위 금액과 혼동하지 않도록 안내.
- `mileage`: 0 이상의 정수.
- `trim`: 미입력 시 `기본 트림` 등 명시적인 기본값.
- `fuel`, `transmission`, `bodyType`, `color`: 선택 입력 권장. 허용값 확인.
- `image`: 제공된 `/assets/cars/` SVG 경로 중 선택. 미입력 시 `/assets/cars/sedan-white.svg`.
- `options`: 선택하지 않았을 때도 빈 배열 `[]` 유지.
- `createdAt`: 서버에서 생성하는 `YYYY-MM-DD` 형식의 등록일.
- `seller`: 수업에서는 가상 이름·마스킹 전화번호·example.com 이메일 사용.

등록 시점마다 서버가 기존 JSON을 읽고 새 차량을 추가하여 파일에 저장하는 흐름을 만듭니다.
서버 시작 때 기본 데이터로 덮어쓰지 마세요. 테스트에서는 별도의 임시 파일을 사용합니다.
JSON 파일 방식은 단일 컴퓨터 수업 범위로 사용하며 실제 다중 사용자 서비스를 위한 DB를 대신한다고 설명하지 않습니다.
