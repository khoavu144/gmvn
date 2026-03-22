# CI workflow (GitHub Actions)

File [frontend-e2e.workflow.yml](./frontend-e2e.workflow.yml) là bản sao của workflow Playwright.

**Nếu `git push` báo lỗi thiếu scope `workflow` trên PAT:** tạo file trên GitHub (repo → Add file) tại đường dẫn `.github/workflows/frontend-e2e.yml` và dán nội dung từ file YAML ở trên, **hoặc** tạo PAT mới có tick **Workflow** rồi push như bình thường.
