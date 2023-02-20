# express-test
# express-test

## 시작과 다시

---

### git 설치

1. git for windows 다운로드
2. 그리고 설치

```cmd
> d:
> cd works/git-remote
> git clone https://github.com/inyounglee/express-test.git
```

## node + npm + yarn + express 설치 및 구동

참고:

* Node + Express + Vue (.js) 노트: <https://docs.google.com/document/d/1Ec4q0TrroMv4A0RnwjMQ2E7VMXeDyIqst3SjetvpBRY>

1. node.js 설치

    * windows

    ```cmd
    ### node.js for windows .msi 를 다운로드해서 설치
    ```

2. npm 설치

    * node.js와 함께 설치되어 있을 것임

    ```cmd
    > npm -v 
    ```

3. yarn 설치

    ```cmd
    > npm install -g yarn
    ```

    * yarn 구동이 안되는 경우

    ```cmd
    > Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
    ```

4. 서버 구동

    * 일단 mongodb, influxdb 등이 준비되지 않은 경우
    * git branch를 route 정도로 변경하여 의존 모듈을 줄여서 테스트 구동한다.

    ```cmd
    > npm install
    ```

    * 위 명령으로 package.json , package-lock.json 이 변경된다.

    ```cmd
    > npm start
    ```

    * 오류) 패키지 모듈 호환에 문제가 있는 경우

    ```cmd
    > npm update
    ```

## Update Log

---

### 2023.02.21) branch route 에서 작업

* 패키지 모듈을 update하고 3000 port 구동 테스트 성공
* README.md 작성
