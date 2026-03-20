import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '../lib/logger';

interface Props {
    children: ReactNode;
    scope?: string;
}

interface State {
    hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
    state: State = {
        hasError: false,
    };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error(`ErrorBoundary (${this.props.scope || 'app'})`, error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false });
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className="min-h-screen bg-white text-black flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-lg rounded-3xl border border-[color:var(--mk-line)] bg-white p-8 shadow-sm text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--mk-muted)]">
                        GYMERVIET
                    </p>
                    <h1 className="mt-4 text-3xl font-black tracking-tight">
                        Đã xảy ra lỗi ở {this.props.scope || 'ứng dụng'}
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--mk-text-soft)]">
                        Phiên hiển thị hiện tại đã bị gián đoạn. Bạn có thể tải lại trang hoặc quay về trang chủ.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <button
                            type="button"
                            onClick={this.handleRetry}
                            className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            Thử lại
                        </button>
                        <a
                            href="/"
                            className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--mk-line)] px-5 py-3 text-sm font-semibold text-[color:var(--mk-text-soft)] transition hover:border-black hover:text-black"
                        >
                            Về trang chủ
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}
