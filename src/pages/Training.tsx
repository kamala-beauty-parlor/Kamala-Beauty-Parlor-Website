import React from 'react';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  MessageCircle, 
  Award, 
  BookOpen, 
  Users, 
  ArrowRight 
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { DynamicSections } from '../components/DynamicSections';

interface TrainingProps {
  setCurrentTab?: (tab: string) => void;
}

export const Training: React.FC<TrainingProps> = ({ setCurrentTab }) => {
  const { courses, settings } = useSite();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Academy Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-[#F7EBEF] text-[#8A2E44] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
          <GraduationCap className="w-4 h-4 text-[#C59B27]" />
          Kamala Beauty Academy • Kathmandu
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
          Professional Beauty & Makeup Training Courses
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Master the art of bridal makeup, advanced hair styling, and certified salon therapies. Learn hands-on with live models under the direct mentorship of Kamala in Swayambhu, Panchdhara.
        </p>
      </div>

      {/* Academy Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E9DDD5] shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-[#FCEFF2] text-[#8A2E44] flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-[#C59B27]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-stone-900">Small Batches</h3>
          <p className="text-xs text-stone-500 mt-1">
            Strict limit of 4-6 students per batch for focused individual attention and coaching.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E9DDD5] shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-[#FCEFF2] text-[#8A2E44] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-[#C59B27]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-stone-900">100% Practical Training</h3>
          <p className="text-xs text-stone-500 mt-1">
            Hands-on work on live models, real client simulation, and color tone blending.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E9DDD5] shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-[#FCEFF2] text-[#8A2E44] flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-[#C59B27]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-stone-900">Course Certificate</h3>
          <p className="text-xs text-stone-500 mt-1">
            Receive an authorized Certificate of Completion to kickstart your freelance or salon career.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E9DDD5] shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-[#FCEFF2] text-[#8A2E44] flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-[#C59B27]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-stone-900">Business Guidance</h3>
          <p className="text-xs text-stone-500 mt-1">
            Learn pricing strategies, product kit purchasing at wholesale, and client Instagram promotion.
          </p>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Available Courses & Certification
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Flexible morning, afternoon, and weekend slots available.
            </p>
          </div>
          <span className="text-xs font-semibold bg-rose-50 text-[#8A2E44] px-3 py-1 rounded-full">
            {courses.filter(c => c.visible !== false).length} Certified Courses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.filter(c => c.visible !== false).sort((a,b) => (a.order ?? 0) - (b.order ?? 0)).map((course) => (
            <div
              key={course.id || course.title}
              className="bg-white rounded-3xl overflow-hidden border border-[#EAE0D6] shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Course Top Image */}
                {course.imageUrl && (
                  <div className="h-48 w-full overflow-hidden relative">
                    <ImageWithFallback
                      src={course.imageUrl}
                      alt={course.title}
                      category="Academy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#8A2E44] shadow-sm">
                      {course.duration}
                    </div>
                  </div>
                )}

                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                      <Clock className="w-4 h-4 text-[#C59B27]" />
                      Duration: {course.duration}
                    </span>
                    <span className="font-serif text-2xl font-black text-[#8A2E44]">
                      Rs. {course.fee.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    {course.title}
                  </h3>

                  <p className="text-stone-600 text-sm leading-relaxed">
                    {course.description}
                  </p>

                  {/* What you'll learn */}
                  {course.topics && course.topics.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2">
                        What You'll Learn:
                      </h4>
                      <ul className="space-y-1.5">
                        {course.topics.map((topic, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                            <CheckCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 sm:px-8 pb-8 pt-0">
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Namaste Kamala Ma’am! I am interested in joining the ${course.title} (Duration: ${course.duration}, Fee: Rs. ${course.fee}). Please share batch timings and enrollment details.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-6 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Enquire on WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Academy FAQ / Consultation Strip */}
      <div className="bg-gradient-to-r from-[#FAF2EC] to-[#FCEEF2] rounded-3xl p-8 border border-[#E6D4C6] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h3 className="font-serif text-2xl font-bold text-stone-900">
            Have Questions About Batches & Syllabus?
          </h3>
          <p className="text-stone-600 text-sm mt-1 max-w-xl">
            We offer free 15-minute counseling sessions. Visit our academy at Swayambhu, Panchdhara or chat directly with trainer Kamala.
          </p>
        </div>

        <a
          href={`tel:${settings.phone}`}
          className="bg-[#8A2E44] hover:bg-[#722335] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-md transition whitespace-nowrap"
        >
          Call Academy Office: {settings.phone}
        </a>
      </div>

      <DynamicSections page="training" setCurrentTab={setCurrentTab || (() => {})} />
    </div>
  );
};
