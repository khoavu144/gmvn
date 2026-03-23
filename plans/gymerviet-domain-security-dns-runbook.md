# Runbook Cứng Hóa Domain `gymerviet.com`

Ngày cập nhật: `2026-03-23`  
Repo: `gmvn`  
Commit code liên quan: `633989a` - `chore(web): harden domain security and canonical metadata`

## 1. Mục tiêu

Tài liệu này dùng để triển khai đầy đủ phần còn lại sau đợt hardening trong repo:

- chuẩn hóa `canonical`, `og:url`, `robots.txt`, `sitemap`
- bổ sung security headers cho frontend deploy
- thêm `security.txt`
- xử lý phần hạ tầng ngoài repo:
  - `DNSSEC`
  - `SPF`
  - `DKIM`
  - `DMARC`
  - rà và sửa `AAAA`

Mục tiêu cuối cùng:

- `gymerviet.com` có host canonical thống nhất
- Web Check không còn báo lỗi rõ ràng ở các mục:
  - `quality` do mismatch domain/meta cơ bản
  - `mail-config`
  - `txt-records`
  - `security.txt`
  - `hsts`
- DNS không còn record `AAAA` sai
- mail verify/reset hoạt động ổn định
- có thể bật `DNSSEC` mà không gây `SERVFAIL`

## 2. Những gì đã sửa trong code

Đợt code đã hoàn tất và đã push lên `main`.

### 2.1. Frontend deploy / domain policy

- thêm redirect `www -> apex` ở [frontend/vercel.json](/Users/mac/Downloads/gymerviet-new/frontend/vercel.json)
- thêm các header:
  - `Content-Security-Policy`
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains`
- thêm fallback header cho Nginx ở [frontend/nginx.conf](/Users/mac/Downloads/gymerviet-new/frontend/nginx.conf)

### 2.2. SEO / canonical

- sửa `robots.txt` về đúng `.com` tại [frontend/public/robots.txt](/Users/mac/Downloads/gymerviet-new/frontend/public/robots.txt)
- thêm `security.txt` tại [frontend/public/.well-known/security.txt](/Users/mac/Downloads/gymerviet-new/frontend/public/.well-known/security.txt)
- tạo helper canonical tập trung tại [frontend/src/lib/site.ts](/Users/mac/Downloads/gymerviet-new/frontend/src/lib/site.ts)
- đồng bộ canonical / OG / Twitter metadata ở:
  - [frontend/src/pages/Home.tsx](/Users/mac/Downloads/gymerviet-new/frontend/src/pages/Home.tsx)
  - [frontend/src/pages/PricingPage.tsx](/Users/mac/Downloads/gymerviet-new/frontend/src/pages/PricingPage.tsx)
  - [frontend/src/pages/NewsPage.tsx](/Users/mac/Downloads/gymerviet-new/frontend/src/pages/NewsPage.tsx)
  - [frontend/src/pages/NewsDetailPage.tsx](/Users/mac/Downloads/gymerviet-new/frontend/src/pages/NewsDetailPage.tsx)
  - [frontend/src/pages/Coaches.tsx](/Users/mac/Downloads/gymerviet-new/frontend/src/pages/Coaches.tsx)
  - [frontend/src/pages/Gyms.tsx](/Users/mac/Downloads/gymerviet-new/frontend/src/pages/Gyms.tsx)
  - [frontend/src/pages/CoachDetailPage.tsx](/Users/mac/Downloads/gymerviet-new/frontend/src/pages/CoachDetailPage.tsx)
  - [frontend/src/pages/AthleteDetailPage.tsx](/Users/mac/Downloads/gymerviet-new/frontend/src/pages/AthleteDetailPage.tsx)
  - [frontend/src/pages/GymDetailPage.tsx](/Users/mac/Downloads/gymerviet-new/frontend/src/pages/GymDetailPage.tsx)
  - [frontend/src/pages/ProfileCV.tsx](/Users/mac/Downloads/gymerviet-new/frontend/src/pages/ProfileCV.tsx)

### 2.3. Sitemap backend

- chuẩn hóa `BASE_URL`
- thêm các route quan trọng:
  - `/marketplace`
  - `/news`
- sửa dynamic URL sang canonical thật:
  - coach slug dùng `/coach/:slug`
  - athlete slug dùng `/athlete/:slug`

File: [backend/src/controllers/sitemapController.ts](/Users/mac/Downloads/gymerviet-new/backend/src/controllers/sitemapController.ts)

## 3. Những gì không thể sửa trong repo

Các việc sau phải làm trong DNS panel / registrar / mail provider:

1. `DNSSEC`
2. `MX`
3. `SPF`
4. `DKIM`
5. `DMARC`
6. record `AAAA`

Tài liệu này tập trung vào chính các bước đó.

## 4. Điều kiện và giả định hiện tại

Dựa trên ảnh Web Check:

- domain chính là `gymerviet.com`
- SSL đang hoạt động
- nameserver hiện tại là:
  - `ns1.inet.vn`
  - `ns2.inet.vn`
  - `ns3.inet.vn`
- registrar cũng là `INET`, nên khả năng cao:
  - zone DNS đang quản lý tại `INET`
  - có thể bật `DNSSEC` trực tiếp trong `INET`

Nếu sau này phát hiện DNS thực tế nằm ở nhà cung cấp khác, áp dụng logic tương tự nhưng làm ở panel của nhà cung cấp đang giữ authoritative zone.

## 5. Thứ tự triển khai bắt buộc

Không làm ngược thứ tự này:

1. backup / export zone DNS hiện tại
2. hạ TTL record sắp sửa
3. sửa `AAAA`
4. sửa `MX`
5. sửa `SPF`
6. thêm `DKIM`
7. thêm `DMARC`
8. kiểm tra gửi mail thật
9. bật `DNSSEC`
10. kiểm tra lại bằng `dig`, Web Check, mail flow

Lý do:

- nếu bật `DNSSEC` trước khi zone sạch, chỉ cần 1 bản ghi hoặc DS sai là toàn bộ domain có thể lỗi resolution
- nếu sửa SPF sai khi mail đang chạy production, mail verify/reset có thể bị reject

## 6. Chuẩn bị trước khi sửa

### 6.1. Vào đúng mục trong INET

Đường đi thao tác:

1. mở [portal.inet.vn](https://portal.inet.vn)
2. đăng nhập tài khoản quản trị domain
3. vào `Tên miền`
4. chọn `gymerviet.com`
5. vào tab `Bản ghi`
6. tìm thêm tab hoặc menu `DNSSEC` hoặc `Khóa tên miền`

### 6.2. Backup trước khi đụng vào zone

Phải làm:

- chụp lại toàn bộ danh sách record
- nếu INET có nút export zone, export luôn
- lưu ít nhất các record hiện tại của:
  - `A`
  - `AAAA`
  - `CNAME`
  - `MX`
  - `TXT`
  - `_dmarc`
  - `_domainkey`

### 6.3. Hạ TTL

Trước khi sửa, đổi TTL của các record sắp thay đổi xuống:

- `300`

Nhóm record cần hạ TTL:

- `@` - `MX`
- `@` - `TXT`
- `_dmarc` - `TXT`
- các record DKIM
- `AAAA` nếu đang có

## 7. Bước 1: Rà và xử lý `AAAA`

### 7.1. Mục tiêu

Nếu chưa dùng IPv6 thật thì xóa `AAAA`.  
Nếu có IPv6 thật từ hosting/CDN thì để đúng giá trị IPv6 đó.

### 7.2. Vào đâu trong INET

`portal.inet.vn -> Tên miền -> gymerviet.com -> Bản ghi`

### 7.3. Record cần kiểm tra

- `@`
- `www`
- `api`
- bất kỳ subdomain production nào khác

### 7.4. Quy tắc thao tác

- nếu record `AAAA` chứa IPv4 như `216.198.79.1` thì record đó sai hoàn toàn
- nếu không dùng IPv6, bấm `Xóa`
- nếu dùng IPv6, thay bằng địa chỉ IPv6 thật do nhà cung cấp hạ tầng cấp

### 7.5. Bảng thao tác

| Tên bản ghi | Loại | Giá trị đúng | TTL | Thao tác |
|---|---|---|---:|---|
| `@` | `AAAA` | để trống hoặc IPv6 thật | `300` | xóa nếu chưa dùng IPv6 |
| `www` | `AAAA` | để trống hoặc IPv6 thật | `300` | xóa nếu chưa dùng IPv6 |
| `api` | `AAAA` | để trống hoặc IPv6 thật | `300` | xóa nếu chưa dùng IPv6 |

### 7.6. Cách kiểm tra sau khi sửa

```bash
dig AAAA gymerviet.com +short
dig AAAA www.gymerviet.com +short
dig AAAA api.gymerviet.com +short
```

Kết quả đúng:

- hoặc không trả về gì
- hoặc trả về IPv6 thật, ví dụ `2a06:...`

## 8. Bước 2: Xác định provider mail

### 8.1. Mục tiêu

Không sửa `MX`, `SPF`, `DKIM` bằng phỏng đoán.

### 8.2. Cách xác định

Trong `INET -> Bản ghi`, nhìn record `MX` hiện tại.

Nhận diện phổ biến:

- `ASPMX.L.GOOGLE.COM` -> Google Workspace
- `mx.zoho.com` -> Zoho Mail
- `*.mail.protection.outlook.com` -> Microsoft 365
- provider giao dịch như `SendGrid`, `Resend`, `SES`, `Mailgun`, `Brevo` thường sẽ không nằm ở `MX`, mà nằm ở `SPF` / `DKIM`

### 8.3. Quy tắc

- mailbox provider và transactional email provider có thể là 2 bên khác nhau
- `MX` phản ánh mailbox provider
- `SPF` có thể cần gộp cả mailbox provider và transactional provider
- `DKIM` phải lấy đúng từ từng provider

## 9. Bước 3: Cấu hình mail nếu dùng Google Workspace

Chỉ áp dụng nếu `MX` hiện tại hoặc mailbox thật sự đang dùng Google Workspace.

### 9.1. Vào đâu trong INET

`portal.inet.vn -> Tên miền -> gymerviet.com -> Bản ghi`

### 9.2. Record MX cần có

Xóa record MX sai hoặc thừa. Sau đó thêm đúng 5 record:

| Tên bản ghi | Loại | Giá trị | Ưu tiên | TTL |
|---|---|---|---:|---:|
| `@` | `MX` | `ASPMX.L.GOOGLE.COM.` | `1` | `300` |
| `@` | `MX` | `ALT1.ASPMX.L.GOOGLE.COM.` | `5` | `300` |
| `@` | `MX` | `ALT2.ASPMX.L.GOOGLE.COM.` | `5` | `300` |
| `@` | `MX` | `ALT3.ASPMX.L.GOOGLE.COM.` | `10` | `300` |
| `@` | `MX` | `ALT4.ASPMX.L.GOOGLE.COM.` | `10` | `300` |

### 9.3. Record SPF cần có

Chỉ giữ đúng 1 SPF:

| Tên bản ghi | Loại | Giá trị | TTL |
|---|---|---|---:|
| `@` | `TXT` | `v=spf1 include:_spf.google.com ~all` | `300` |

Nếu đang có transactional email provider dùng song song, không dùng record trên nguyên xi. Xem mục 12.

### 9.4. Record DKIM cần có

Không có giá trị DKIM cố định. Phải lấy từ Google Admin:

1. vào `admin.google.com`
2. `Apps`
3. `Google Workspace`
4. `Gmail`
5. `Authenticate email`
6. chọn domain `gymerviet.com`
7. `Generate new record`

Sau đó thêm vào INET:

| Tên bản ghi | Loại | Giá trị | TTL |
|---|---|---|---:|
| selector do Google cấp, ví dụ `google._domainkey` | `TXT` | chuỗi DKIM Google cấp | `300` |

### 9.5. Điều bắt buộc

- không tự bịa selector DKIM
- không cắt bớt chuỗi DKIM
- không để 2 SPF record khác nhau

## 10. Bước 4: Cấu hình mail nếu dùng Zoho Mail

Chỉ áp dụng nếu mailbox đang dùng Zoho.

### 10.1. MX cần có

| Tên bản ghi | Loại | Giá trị | Ưu tiên | TTL |
|---|---|---|---:|---:|
| `@` | `MX` | `mx.zoho.com.` | `10` | `300` |
| `@` | `MX` | `mx2.zoho.com.` | `20` | `300` |
| `@` | `MX` | `mx3.zoho.com.` | `50` | `300` |

### 10.2. SPF cần có

| Tên bản ghi | Loại | Giá trị | TTL |
|---|---|---|---:|
| `@` | `TXT` | `v=spf1 include:zoho.com ~all` | `300` |

### 10.3. DKIM cần có

Lấy đúng selector và value từ Zoho Admin, rồi thêm vào INET:

| Tên bản ghi | Loại | Giá trị | TTL |
|---|---|---|---:|
| selector Zoho cấp, ví dụ `zoho._domainkey` | `TXT` | chuỗi DKIM Zoho cấp | `300` |

## 11. Bước 5: Cấu hình mail nếu dùng Microsoft 365

Chỉ áp dụng nếu mailbox đang dùng Microsoft 365.

### 11.1. MX / DKIM / Autodiscover

Không nên tự suy đoán toàn bộ record của Microsoft 365.  
Phải lấy đúng trong `admin.microsoft.com`.

Đường đi:

1. `admin.microsoft.com`
2. `Settings`
3. `Domains`
4. chọn `gymerviet.com`
5. copy toàn bộ record Microsoft yêu cầu

Sau đó dán đúng sang INET.

### 11.2. SPF thường dùng

| Tên bản ghi | Loại | Giá trị | TTL |
|---|---|---|---:|
| `@` | `TXT` | `v=spf1 include:spf.protection.outlook.com ~all` | `300` |

Chỉ dùng record này nếu Microsoft 365 đúng là mailbox provider chính.

## 12. Nếu app gửi mail qua provider giao dịch riêng

Đây là tình huống rất phổ biến:

- mailbox người dùng thật chạy qua `Google Workspace`
- backend gửi mail verify/reset qua `Resend`, `SES`, `SendGrid`, `Mailgun`, `Brevo` hoặc provider SMTP khác

### 12.1. Quy tắc phải nhớ

- `MX` vẫn theo mailbox provider
- `DKIM` mailbox theo mailbox provider
- `DKIM` transactional theo provider gửi mail app
- `SPF` phải gộp vào duy nhất 1 record

### 12.2. Ví dụ SPF gộp

Nếu mailbox là Google Workspace và app mail là provider khác:

```txt
v=spf1 include:_spf.google.com include:PROVIDER_SPF ~all
```

Ví dụ thực tế:

```txt
v=spf1 include:_spf.google.com include:spf.resend.com ~all
```

hoặc:

```txt
v=spf1 include:_spf.google.com include:amazonses.com ~all
```

### 12.3. Điều bắt buộc

- không tạo record SPF thứ hai
- mỗi provider transactional phải lấy đúng `SPF include` và `DKIM` từ dashboard của họ
- không dùng ví dụ trong tài liệu này làm giá trị production nếu chưa xác nhận provider thật

## 13. Bước 6: Thêm `DMARC`

### 13.1. Mục tiêu

Có record DMARC hợp lệ để Web Check không báo lỗi `mail-config/txt-records` và để giám sát mail giả mạo.

### 13.2. Vào đâu trong INET

`portal.inet.vn -> Tên miền -> gymerviet.com -> Bản ghi`

### 13.3. Record cần thêm ngay

| Tên bản ghi | Loại | Giá trị | TTL |
|---|---|---|---:|
| `_dmarc` | `TXT` | `v=DMARC1; p=none; rua=mailto:dmarc@gymerviet.com; adkim=s; aspf=s; fo=1; pct=100` | `300` |

### 13.4. Lộ trình siết chặt

Sau 1-2 tuần nếu mail pass ổn:

```txt
v=DMARC1; p=quarantine; rua=mailto:dmarc@gymerviet.com; adkim=s; aspf=s; fo=1; pct=100
```

Khi đã chắc chắn:

```txt
v=DMARC1; p=reject; rua=mailto:dmarc@gymerviet.com; adkim=s; aspf=s; fo=1; pct=100
```

### 13.5. Lưu ý

- tạo mailbox `dmarc@gymerviet.com` hoặc đảm bảo nó nhận được mail
- không nhảy thẳng lên `reject` nếu chưa kiểm tra report

## 14. Bước 7: Bật `DNSSEC` trong INET

### 14.1. Chỉ làm sau khi xong bước 7 đến 13

Không bật DNSSEC nếu:

- `AAAA` còn sai
- `MX/SPF/DKIM/DMARC` còn chưa rõ
- zone còn đang chỉnh dở

### 14.2. Vào đâu trong INET

Dự kiến:

1. `portal.inet.vn`
2. `Tên miền`
3. chọn `gymerviet.com`
4. tìm tab `DNSSEC` hoặc `Khóa tên miền`
5. bấm `Bật DNSSEC`

### 14.3. Nếu hệ thống hiển thị khóa / DS

Lưu lại các trường sau:

- `Key Tag`
- `Algorithm`
- `Digest Type`
- `Digest`

Nếu `INET` vừa là registrar vừa là DNS host, khả năng cao hệ thống sẽ tự xử lý việc publish `DS`.

### 14.4. Nếu không thấy tùy chọn DNSSEC

Làm 1 trong các cách sau:

- mở ticket tại portal INET
- gọi `1900 9250`
- gửi email hỗ trợ tên miền của INET

Nội dung yêu cầu:

> Cần bật DNSSEC cho domain `gymerviet.com`. Domain và nameserver hiện đều đang quản lý tại INET. Vui lòng hướng dẫn hoặc kích hoạt giúp DNSSEC cho authoritative zone hiện tại.

### 14.5. Rủi ro chính

Nếu bật DNSSEC sai:

- domain có thể ra `SERVFAIL`
- website và mail có thể cùng lỗi resolution

### 14.6. Kế hoạch rollback nếu DNSSEC lỗi

1. tắt `DNSSEC` trong panel ngay
2. nếu có `DS` được publish ở registrar mà DNSKEY không khớp, xóa `DS`
3. đợi propagate
4. kiểm tra lại bằng `dig`

## 15. Các record mẫu theo đúng trường form của INET

Đây là mẫu để copy khi nhập thủ công.

### 15.1. DMARC

- Tên bản ghi: `_dmarc`
- Loại bản ghi: `TXT`
- Giá trị bản ghi:

```txt
v=DMARC1; p=none; rua=mailto:dmarc@gymerviet.com; adkim=s; aspf=s; fo=1; pct=100
```

- TTL: `300`

### 15.2. SPF Google Workspace

- Tên bản ghi: `@`
- Loại bản ghi: `TXT`
- Giá trị bản ghi:

```txt
v=spf1 include:_spf.google.com ~all
```

- TTL: `300`

### 15.3. SPF Zoho

- Tên bản ghi: `@`
- Loại bản ghi: `TXT`
- Giá trị bản ghi:

```txt
v=spf1 include:zoho.com ~all
```

- TTL: `300`

### 15.4. SPF Microsoft 365

- Tên bản ghi: `@`
- Loại bản ghi: `TXT`
- Giá trị bản ghi:

```txt
v=spf1 include:spf.protection.outlook.com ~all
```

- TTL: `300`

### 15.5. SPF Google + provider gửi mail app

- Tên bản ghi: `@`
- Loại bản ghi: `TXT`
- Giá trị bản ghi:

```txt
v=spf1 include:_spf.google.com include:PROVIDER_SPF ~all
```

- TTL: `300`

Lưu ý:

- thay `PROVIDER_SPF` bằng đúng include của provider thật
- ví dụ `spf.resend.com`, `mailgun.org`, `amazonses.com`, `sendgrid.net`

### 15.6. MX Google Workspace

- Tên bản ghi: `@`
- Loại bản ghi: `MX`
- Giá trị bản ghi: `ASPMX.L.GOOGLE.COM.`
- Ưu tiên: `1`
- TTL: `300`

- Tên bản ghi: `@`
- Loại bản ghi: `MX`
- Giá trị bản ghi: `ALT1.ASPMX.L.GOOGLE.COM.`
- Ưu tiên: `5`
- TTL: `300`

- Tên bản ghi: `@`
- Loại bản ghi: `MX`
- Giá trị bản ghi: `ALT2.ASPMX.L.GOOGLE.COM.`
- Ưu tiên: `5`
- TTL: `300`

- Tên bản ghi: `@`
- Loại bản ghi: `MX`
- Giá trị bản ghi: `ALT3.ASPMX.L.GOOGLE.COM.`
- Ưu tiên: `10`
- TTL: `300`

- Tên bản ghi: `@`
- Loại bản ghi: `MX`
- Giá trị bản ghi: `ALT4.ASPMX.L.GOOGLE.COM.`
- Ưu tiên: `10`
- TTL: `300`

## 16. Bộ lệnh kiểm tra sau khi sửa

Chạy lần lượt:

```bash
dig NS gymerviet.com +short
dig A gymerviet.com +short
dig AAAA gymerviet.com +short
dig MX gymerviet.com +short
dig TXT gymerviet.com +short
dig TXT _dmarc.gymerviet.com +short
dig DS gymerviet.com +short
dig DNSKEY gymerviet.com +short
```

Nếu dùng Google DKIM:

```bash
dig TXT google._domainkey.gymerviet.com +short
```

Nếu dùng selector khác thì thay selector tương ứng.

## 17. Kết quả mong muốn sau từng bước

### Sau bước AAAA

- `dig AAAA gymerviet.com +short` trả về:
  - rỗng, hoặc
  - IPv6 thật

### Sau bước mail TXT / MX

- `dig MX gymerviet.com +short` đúng provider
- `dig TXT gymerviet.com +short` chỉ có 1 SPF
- `dig TXT _dmarc.gymerviet.com +short` có DMARC
- `dig TXT/CNAME selector._domainkey...` resolve đúng

### Sau bước DNSSEC

- `dig DS gymerviet.com +short` có dữ liệu
- `dig DNSKEY gymerviet.com +short` có dữ liệu
- domain không bị `SERVFAIL`

## 18. Kiểm tra nghiệp vụ sau khi DNS chạy ổn

### 18.1. Mail flow

Kiểm tra thực tế:

1. đăng ký tài khoản mới
2. gửi mail verify email
3. gửi mail reset password
4. kiểm tra mail có vào inbox/spam hay không
5. kiểm tra SPF/DKIM/DMARC trong phần headers của email nhận được

### 18.2. Website

Kiểm tra:

1. `https://gymerviet.com`
2. `https://www.gymerviet.com` phải redirect 301 về apex
3. `https://gymerviet.com/robots.txt`
4. `https://gymerviet.com/sitemap.xml`
5. `https://gymerviet.com/.well-known/security.txt`

### 18.3. External tools

Chạy lại:

- Web Check
- SSL Labs
- Google Search Console URL Inspection

## 19. Những lỗi thường gặp và cách xử lý

### 19.1. Có 2 SPF record

Triệu chứng:

- mail fail SPF
- Web Check báo `txt-records`

Cách xử lý:

- gộp toàn bộ include về 1 record duy nhất

### 19.2. DKIM không pass

Nguyên nhân:

- sai selector
- copy thiếu chuỗi TXT
- dùng nhầm record của provider khác

Cách xử lý:

- xóa record DKIM sai
- lấy lại đúng từ dashboard provider

### 19.3. Bật DNSSEC xong site die

Nguyên nhân:

- DS không khớp DNSKEY
- DNSSEC bật ở zone nhưng không publish đúng parent

Cách xử lý:

- tắt DNSSEC hoặc xóa DS sai ngay
- chờ propagate

### 19.4. AAAA làm timeout hoặc trỏ sai

Nguyên nhân:

- IPv6 stale
- copy IPv4 vào AAAA

Cách xử lý:

- xóa AAAA nếu không có IPv6 thật

## 20. Checklist vận hành dạng tick-box

### 20.1. Phần DNS chung

- [ ] Đăng nhập `portal.inet.vn`
- [ ] Vào `Tên miền -> gymerviet.com -> Bản ghi`
- [ ] Chụp/export toàn bộ zone hiện tại
- [ ] Hạ TTL record sắp sửa xuống `300`

### 20.2. AAAA

- [ ] Kiểm tra `AAAA` của `@`
- [ ] Kiểm tra `AAAA` của `www`
- [ ] Kiểm tra `AAAA` của `api`
- [ ] Xóa toàn bộ AAAA nếu chưa có IPv6 thật

### 20.3. Mail

- [ ] Xác định mailbox provider
- [ ] Sửa `MX` đúng provider
- [ ] Chỉ để đúng 1 record `SPF`
- [ ] Thêm `DKIM` đúng selector
- [ ] Thêm `DMARC p=none`
- [ ] Gửi test verify email
- [ ] Gửi test reset password

### 20.4. DNSSEC

- [ ] Kiểm tra domain và mail đang hoạt động ổn
- [ ] Vào mục `DNSSEC` trong INET
- [ ] Bật DNSSEC
- [ ] Kiểm tra `DS`
- [ ] Kiểm tra `DNSKEY`
- [ ] Kiểm tra website không `SERVFAIL`

### 20.5. Sau triển khai

- [ ] Redeploy frontend
- [ ] Kiểm tra `robots.txt`
- [ ] Kiểm tra `sitemap.xml`
- [ ] Kiểm tra `security.txt`
- [ ] Chạy lại Web Check
- [ ] Chạy lại SSL Labs

## 21. Chỗ cần điền thêm trước khi áp dụng production

Điền rõ các mục sau:

- mailbox provider thật là gì: `________________`
- provider gửi mail giao dịch của app là gì: `________________`
- app có dùng IPv6 thật hay không: `________________`
- ai là người có quyền bật DNSSEC trên INET: `________________`
- email nhận DMARC report: `________________`

## 22. Kết luận vận hành

Đợt code đã xử lý xong phần trong repo:

- canonical
- meta consistency
- robots
- sitemap
- frontend security headers
- security.txt

Phần còn lại để Web Check sạch và mail/domain ổn định nằm ở DNS / mail provider.  
Tài liệu này là checklist triển khai chuẩn cho giai đoạn đó.
