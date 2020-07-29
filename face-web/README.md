## FACE-WEB
---
face-web It is a tool that enables web/pc browser cameras to capture real-time face (front) screenshots

### Characteristic
- Easy to call Web / PC browser camera
- Integration of Face Recognition (Front/Plane) Algorithms
- Generating real-time screenshots of Base64

### NPM

```
npm install face-web --save
```

```
import { FaceWeb } from 'face-web';

<FaceWeb
  onChange={base64 => {}}
/>
```

### Github
you can see demo in [github](https://github.com/csj5588/Face-Web)

```
1、cnpm install
```

```
2、cnpm start
```

### API

|  field   | type  | remark |
|  ----  | ----  | ---- |
| onChange  | func | cb base64 |
| className  | String | cover style |
| debounceTime  | Number | output rate |

### Demo Gif

![](https://user-gold-cdn.xitu.io/2019/8/28/16cd63c979362b67?w=373&h=811&f=gif&s=4081843)
