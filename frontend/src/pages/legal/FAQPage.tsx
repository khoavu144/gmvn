import LegalPageLayout from '../../components/LegalPageLayout';
import { Link } from 'react-router-dom';
import { faqData } from '../../data/faqData';
import { FAQAccordion } from '../../components/FAQAccordion';

export default function FAQPage() {
    return (
        <LegalPageLayout
            title="Câu hỏi thường gặp"
            subtitle="Tìm câu trả lời nhanh cho các thắc mắc phổ biến nhất."
            breadcrumbs={[{ label: 'Hỏi đáp FAQ' }]}
            maxWidth="xl"
        >
            <div className="space-y-8">
                {faqData.map((cat) => (
                    <div key={cat.title}>
                        <h2 className="flex items-center gap-2 text-base font-bold text-black mb-4">
                            <span>{cat.icon}</span>
                            <span>{cat.title}</span>
                        </h2>
                        <FAQAccordion items={cat.items} />
                    </div>
                ))}
            </div>

            <div className="mt-10 p-6 border border-gray-200 rounded-xs bg-white text-center">
                <h3 className="font-bold text-black mb-2">Không tìm thấy câu trả lời?</h3>
                <p className="text-sm text-gray-600 mb-4">Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp bạn.</p>
                <Link to="/contact" className="btn-primary inline-flex">
                    Liên hệ hỗ trợ
                </Link>
            </div>
        </LegalPageLayout>
    );
}
