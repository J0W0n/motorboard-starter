import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { getCars, getCarById } from './src/car-store.js';

const publicDirectory = fileURLToPath(new URL('./public/', import.meta.url));
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function sendJson(response, status, data, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  response.end(JSON.stringify(data));
}

// 서버와 데이터 읽기를 분리해, 학생이 수정할 위치를 찾기 쉽게 합니다.
export function createApp(store = { getCars, getCarById }) {
  return http.createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");

    try {
      const url = new URL(request.url, 'http://localhost');
      let pathname;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        return sendJson(response, 400, { message: '올바르지 않은 주소입니다.' });
      }

      // 실습: 차량 등록을 구현할 때 POST /api/cars 처리를 추가합니다.
      // 기본 제공본은 조회만 지원하며 저장 기능은 구현하지 않습니다.
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return sendJson(response, 405, { message: '현재 제공본은 조회만 지원합니다.' }, { Allow: 'GET, HEAD' });
      }

      if (pathname === '/api/cars') {
        return sendJson(response, 200, { cars: await store.getCars() });
      }

      const detailMatch = pathname.match(/^\/api\/cars\/([a-zA-Z0-9-]+)$/);
      if (detailMatch) {
        const car = await store.getCarById(detailMatch[1]);
        return car
          ? sendJson(response, 200, { car })
          : sendJson(response, 404, { message: '해당 차량을 찾을 수 없습니다.' });
      }

      if (pathname.startsWith('/api/')) {
        return sendJson(response, 404, { message: '요청한 API를 찾을 수 없습니다.' });
      }

      const requestedFile = pathname === '/' ? 'index.html' : pathname.slice(1);
      const filePath = path.resolve(publicDirectory, requestedFile);
      const relativePath = path.relative(publicDirectory, filePath);
      const type = contentTypes[path.extname(filePath)];

      // public 폴더 밖의 코드·JSON·환경 파일은 브라우저에 공개하지 않습니다.
      if (pathname.includes('\\') || pathname.includes('\0') || relativePath.startsWith('..') || path.isAbsolute(relativePath) || !type) {
        return sendJson(response, 404, { message: '페이지를 찾을 수 없습니다.' });
      }

      try {
        const file = await readFile(filePath);
        response.writeHead(200, { 'Content-Type': type });
        response.end(request.method === 'HEAD' ? undefined : file);
      } catch (error) {
        if (error.code === 'ENOENT' || error.code === 'EISDIR' || error.code === 'ENOTDIR') {
          return sendJson(response, 404, { message: '페이지를 찾을 수 없습니다.' });
        }
        throw error;
      }
    } catch (error) {
      console.error('[요청 처리 오류]', error.message);
      sendJson(response, 500, { message: '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' });
    }
  });
}

// 테스트에서 import할 때에는 서버를 자동 실행하지 않습니다.
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('PORT는 1~65535 사이의 숫자여야 합니다.');
    process.exit(1);
  }
  const server = createApp();
  server.on('error', (error) => {
    console.error(error.code === 'EADDRINUSE'
      ? `${port}번 포트가 사용 중입니다. 기존 서버를 종료하거나 PORT를 바꿔 주세요.`
      : `서버 실행 실패: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => {
    console.log(`\n  MOTORBOARD\n  http://127.0.0.1:${port}\n  종료: Ctrl+C\n`);
  });
}
