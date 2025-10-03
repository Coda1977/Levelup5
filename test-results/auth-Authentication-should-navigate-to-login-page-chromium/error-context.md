# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "LevelUp" [ref=e4] [cursor=pointer]:
        - /url: /
        - text: Level
        - generic [ref=e5] [cursor=pointer]: Up
      - navigation [ref=e6]:
        - link "Sign in" [active] [ref=e7] [cursor=pointer]:
          - /url: /auth/login
  - alert [ref=e8]
  - generic [ref=e10]:
    - heading "Login to LevelUp" [level=1] [ref=e11]
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]: Email Address
        - textbox "Email Address" [ref=e15]
      - generic [ref=e16]:
        - generic [ref=e17]: Password
        - textbox "Password" [ref=e18]
      - button "Sign in" [ref=e20] [cursor=pointer]
    - paragraph [ref=e21]:
      - text: Don't have an account?
      - link "Sign up" [ref=e22] [cursor=pointer]:
        - /url: /auth/signup
```