const jwt = require('jsonwebtoken');

//검문소 시스템
function authMiddleware(req, res, next) { //Express는 HTTP요청을 받으면 이를 JavaScript객체(req)로 만들고, 이를 Middleware에 넘긴다.
  try {
    const authHeader = req.headers.authorization; //-> 요청헤더에서 Bearer eyJhbGciOi..."같은 것들을 찾아서 authHeader객체에 저장

    if (!authHeader) { //-> 만약 없으면 토큰 없음으로 입장거부
      return res.status(401).json({
        message: 'Authorization 헤더가 없습니다.',
      });
    }

    const [tokenType, token] = authHeader.split(' '); //-> Bearer eyJhbGciOi을 둘로 자름, tokentype = Bearer / token = eyJhbGciOi 이런식으로...

    if (tokenType !== 'Bearer' || !token) { //-> 형식이 이상하면 거부
      return res.status(401).json({
        message: '토큰 형식이 올바르지 않습니다.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); //-> 이 JWT가 우리 서버의 JWT_SECRET으로 서명된 진짜 토큰인가? 서버가 확인, 로그인할 때 서버가 JWT를 만들면서, 사용자 정보와 jwt_secret을 사용하여 서명을 만들어 놓았다. 이를 통해 서버가 자신이 발급한 토큰이 맞는지 확인

    req.user = { //-> 검문 통과시 아래와 같이 요청 객체에 사용자 정보를 붙임, 이제부터 API는 유저가 보낸 user_id를 믿지 않고 서버가 검증한 req.user.id를 믿게 된다.
      id: decoded.id,
      email: decoded.email,
    };

    next(); //-> 검증 끝났고 정상 사용자니 다음 처리 함수로 보내라
  } catch (error) {
    console.error('[AUTH MIDDLEWARE ERROR]', error);

    return res.status(401).json({
      message: '유효하지 않은 토큰입니다.',
    });
  }
}

module.exports = authMiddleware; // 내가 만든 authMiddleware객체를 다른 파일에서도 사용할 수 있도록 보낸다