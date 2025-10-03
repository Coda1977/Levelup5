# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "LevelUp" [ref=e4]:
        - /url: /
        - text: Level
        - generic [ref=e5]: Up
      - navigation [ref=e6]:
        - link "Sign in" [ref=e7] [cursor=pointer]:
          - /url: /auth/login
  - generic [ref=e9]:
    - heading "Login to LevelUp" [level=1] [ref=e10]
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: Email Address
        - textbox "Email Address" [ref=e14]
      - generic [ref=e15]:
        - generic [ref=e16]: Password
        - textbox "Password" [ref=e17]
      - button "Sign in" [ref=e19] [cursor=pointer]
    - paragraph [ref=e20]:
      - text: Don't have an account?
      - link "Sign up" [ref=e21]:
        - /url: /auth/signup
  - alert [ref=e22]
```