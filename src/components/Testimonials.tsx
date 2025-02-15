import Image from 'next/image';


const testimonials = [
  {
    content: "Cette solution a révolutionné ma stratégie sur Twitter. Je gagne un temps précieux tout en maintenant une présence constante.",
    author: "Marie Laurent",
    role: "Créatrice de contenu",
    avatar: "/avatars/avatar-1.jpg"
  },
  {
    content: "L&rsquo;IA comprend parfaitement l&rsquo;essence de mes vidéos et crée des tweets qui engagent vraiment ma communauté.",
    author: "Thomas Dubois",
    role: "YouTubeur Tech",
    avatar: "/avatars/avatar-2.jpg"
  },
  {
    content: "Un outil indispensable pour tout créateur de contenu. La qualité des tweets générés est impressionnante !",
    author: "Sophie Martin",
    role: "Blogueuse & Influenceuse",
    avatar: "/avatars/avatar-3.jpg"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white opacity-70" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 mb-4">
            Témoignages
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez ce que nos utilisateurs disent de notre solution d&apos;automatisation de tweets
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-100 hover:-translate-y-1"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="absolute -top-4 -left-2 text-5xl text-blue-200 opacity-50">&quot;</div>
                
                <p className="text-gray-700 mb-6 relative z-10 leading-relaxed">
                  {testimonial.content}
                </p>
                
                <div className="flex items-center">
                  <div className="relative w-12 h-12">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      fill
                      className="rounded-full object-cover ring-2 ring-white shadow-lg"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">{testimonial.author}</h3>
                    <p className="text-sm text-blue-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
