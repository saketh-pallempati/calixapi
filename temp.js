const x = ['B.Tech. Computer Science & Business Systems',
    'B.Tech. Computer Science & Engineering',
    'B.Tech. Computer Science & Engineering (Artificial Intelligence & Data Science)',
    'B.Tech. Computer Science & Engineering (Cyber Security & Blockchain Technology)',
    'B.Tech. Computer Science & Engineering (IoT & Automation)',
    'B.Tech. Information & Communication Technology',
    'B.Tech. Information Technology']
ans = x.map((i) => i.replace("B.Tech. ", ""))
console.log(ans);
