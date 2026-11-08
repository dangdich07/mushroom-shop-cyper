import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";

export default function ProductDetailLoading() {
  return (
    <PageWrapper>
      <div className="home-bio-shell min-h-screen border-b border-primary-neon/10 py-6 sm:py-8 lg:py-10">
        <Container wide>
          <div className="animate-pulse motion-reduce:animate-none" role="status" aria-live="polite" aria-busy="true">
            <span className="sr-only">Đang tải chi tiết sản phẩm</span>
            <div className="mb-7 h-11 w-full max-w-md rounded-control bg-surface-overlay/75" />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:gap-7 xl:gap-9">
              <div className="aspect-[4/3] rounded-[14px] border border-primary-neon/15 bg-surface-glass sm:aspect-[1.12]" />
              <div className="min-h-[34rem] rounded-[14px] border border-primary-neon/15 bg-surface-glass p-7">
                <div className="h-8 w-48 rounded-control bg-surface-overlay" />
                <div className="mt-6 h-14 w-5/6 rounded-control bg-surface-overlay" />
                <div className="mt-3 h-14 w-2/3 rounded-control bg-surface-overlay" />
                <div className="mt-8 h-5 w-full rounded-control bg-surface-overlay" />
                <div className="mt-3 h-5 w-4/5 rounded-control bg-surface-overlay" />
                <div className="mt-8 h-12 w-52 rounded-control bg-surface-overlay" />
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="h-20 rounded-control bg-surface-overlay" />
                  <div className="h-20 rounded-control bg-surface-overlay" />
                </div>
                <div className="mt-8 h-14 rounded-control bg-primary-neon/15" />
              </div>
            </div>
            <div className="mt-10 h-72 rounded-[14px] border border-primary-neon/15 bg-surface-glass" />
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}
