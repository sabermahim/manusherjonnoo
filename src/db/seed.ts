import { db } from './index.ts';
import {
  helpCategories,
  helpRequests,
  notifications,
  users,
  volunteers,
} from './schema.ts';
import { count, eq } from 'drizzle-orm';

export async function seedDatabase() {
  try {
    // Check if admin with admin@mail.com exists; if not, create/update it
    const [existingMailAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@mail.com'))
      .limit(1);

    if (!existingMailAdmin) {
      const [anyAdmin] = await db
        .select()
        .from(users)
        .where(eq(users.role, 'ADMIN'))
        .limit(1);

      if (anyAdmin) {
        await db
          .update(users)
          .set({ email: 'admin@mail.com' })
          .where(eq(users.id, anyAdmin.id));
      } else {
        await db.insert(users).values({
          uid: 'system_admin_main_uid',
          email: 'admin@mail.com',
          name: 'মানুষের জন্য অ্যাডমিন',
          phone: '০১৭০০০০০০০০',
          role: 'ADMIN',
          area: 'ঢাকা কেন্দ্রীয় কার্যালয়',
        });
      }
    }
    // Check if categories already exist
    const [{ value: catCount }] = await db.select({ value: count() }).from(helpCategories);
    if (Number(catCount) === 0) {
      console.log('Seeding categories...');
      await db.insert(helpCategories).values([
        {
          name: 'শিক্ষা সহায়তা',
          icon: 'GraduationCap',
          description: 'বই-খাতা, স্কুল ড্রেস, বেতন বা পড়ালেখার প্রয়োজনীয় সামগ্রী প্রদান।',
        },
        {
          name: 'খাবার',
          icon: 'Utensils',
          description: 'অনাহারে থাকা পরিবার বা প্রবীণদের খাদ্য সামগ্রী ও রান্না করা খাবার বিতরণ।',
        },
        {
          name: 'পোশাক',
          icon: 'Shirt',
          description: 'শীতবস্ত্র, শিশুদের জামাকাপড় ও মৌলিক পোশাক সহায়তা।',
        },
        {
          name: 'চিকিৎসা সহায়তা',
          icon: 'Stethoscope',
          description: 'প্রেসক্রিপশন ওষুধ, প্রাথমিক চিকিৎসা সরঞ্জাম বা হাসপাতালের জরুরি চিকিৎসা সহায়তা।',
        },
        {
          name: 'জরুরি সহায়তা',
          icon: 'AlertTriangle',
          description: 'দুর্যোগ, দুর্ঘটনা বা তাৎক্ষণিক বিপদে জীবনরক্ষাকারী মানবিক সহায়তা।',
        },
        {
          name: 'বাসস্থান সহায়তা',
          icon: 'Home',
          description: 'ছাদ মেরামত, পলিথিন/টিন বা অস্থায়ী আশ্রয় নিশ্চিতকরণ।',
        },
        {
          name: 'দৈনন্দিন প্রয়োজন',
          icon: 'ShoppingBag',
          description: 'হুইলচেয়ার, চশমা বা প্রতিবন্ধী ব্যক্তিদের চলাচলের সহায়ক উপকরণ।',
        },
        {
          name: 'অন্যান্য',
          icon: 'HeartHandshake',
          description: 'অন্যান্য সামাজিক ও মানবিক সহযোগিতা।',
        },
      ]);
    }

    // Check if demo users exist
    const [{ value: userCount }] = await db.select({ value: count() }).from(users);
    if (Number(userCount) === 0) {
      console.log('Seeding demo users and requests...');
      // 1. Admin user
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@mail.com';
      const [admin] = await db
        .insert(users)
        .values({
          uid: 'system_admin_uid_001',
          email: adminEmail,
          name: 'মানুষের জন্য অ্যাডমিন',
          phone: '০১৭০০০০০০০০',
          role: 'ADMIN',
          area: 'ঢাকা কেন্দ্রীয় কার্যালয়',
        })
        .returning();

      // 2. Demo Normal Users
      const [user1] = await db
        .insert(users)
        .values({
          uid: 'demo_user_1',
          email: 'rahim.ahmed@example.com',
          name: 'আব্দুর রহিম',
          phone: '০১৮১১২৩৪৫৬৭',
          role: 'USER',
          area: 'মিরপুর-১০, ঢাকা',
        })
        .returning();

      const [user2] = await db
        .insert(users)
        .values({
          uid: 'demo_user_2',
          email: 'fatema.begum@example.com',
          name: 'ফাতেমা বেগম',
          phone: '০১৯১১৭৬৫৪৩২',
          role: 'USER',
          area: 'মোহাম্মদপুর, ঢাকা',
        })
        .returning();

      // 3. Demo Volunteers
      const [vol1] = await db
        .insert(users)
        .values({
          uid: 'demo_vol_1',
          email: 'tanvir.hasan@example.com',
          name: 'তানভীর হাসান (স্বেচ্ছাসেবক)',
          phone: '০১৭৫৫৮৮৯৯০০',
          role: 'VOLUNTEER',
          area: 'ধানমন্ডি, ঢাকা',
        })
        .returning();

      await db.insert(volunteers).values({
        userId: vol1.id,
        skills: 'শিক্ষা সহায়তা, খাবার বিতরণ, কম্পিউটার প্রশিক্ষণ',
        availability: 'সপ্তাহান্ত (শুক্র-শনি) ও ছুটির দিন',
        totalCompleted: 5,
        isAvailable: true,
      });

      const [vol2] = await db
        .insert(users)
        .values({
          uid: 'demo_vol_2',
          email: 'nusrat.jahan@example.com',
          name: 'নুসরাত জাহান (স্বেচ্ছাসেবক)',
          phone: '০১৬৭৭৪৪১১২২',
          role: 'VOLUNTEER',
          area: 'উত্তরা সেক্টর ৭, ঢাকা',
        })
        .returning();

      await db.insert(volunteers).values({
        userId: vol2.id,
        skills: 'প্রাথমিক চিকিৎসা, শিশু যত্ন, জরুরি ত্রাণ বিতরণ',
        availability: 'প্রতিদিন বিকাল ৫টা থেকে রাত ৯টা',
        totalCompleted: 8,
        isAvailable: true,
      });

      // 4. Realistic Demo Help Requests (with approximate coordinates in Dhaka)
      await db.insert(helpRequests).values([
        {
          creatorId: user1.id,
          category: 'শিক্ষা সহায়তা',
          title: 'ষষ্ঠ শ্রেণির এতিম শিক্ষার্থীর বই ও স্কুল ড্রেস সহায়তা',
          description:
            'আমাদের পাড়ার এক দিনমজুরের সন্তান এ বছর ষষ্ঠ শ্রেণিতে উঠেছে। অর্থাভাবে সে পাঠ্যবইয়ের গাইড ও স্কুল ব্যাগ কিনতে পারছে না। নিয়মিত স্কুলে যেতে তার কিছু খাতা, কলম ও একটি স্কুল ব্যাগের জরুরি প্রয়োজন।',
          beneficiaryName: 'সাকিব (ছদ্মনাম)',
          beneficiaryAge: '১২ বছর',
          approxLat: 23.807,
          approxLng: 90.368,
          locationName: 'মিরপুর-১, ঢাকা',
          urgency: 'মাঝারি',
          requiredAssistance: 'বই, খাতা, কলম এবং স্কুল ব্যাগ',
          additionalInfo: 'স্থানীয় স্কুলের প্রধান শিক্ষক প্রত্যয়ন করেছেন।',
          educationDetails: JSON.stringify({
            age: '১২ বছর',
            level: 'ষষ্ঠ শ্রেণি',
            neededMaterials: '৬টি বাংলা ও ইংরেজি নোটবুক, জ্যামিতি বক্স, স্কুল ব্যাগ',
            school: 'মিরপুর সরকারি প্রাথমিক/উচ্চ বিদ্যালয় সংলগ্ন',
          }),
          imageUrl:
            'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
          status: 'অনুমোদিত',
          isVerified: true,
          volunteerNeeded: true,
        },
        {
          creatorId: user2.id,
          category: 'চিকিৎসা সহায়তা',
          title: 'বৃদ্ধ চা বিক্রেতার হাঁপানির ইনহেলার ও জরুরি ওষুধ প্রয়োজন',
          description:
            'মোহাম্মদপুর বাসস্ট্যান্ড সংলগ্ন মোড়ের বৃদ্ধ চা বিক্রেতা চাচা তীব্র শ্বাসকষ্টে ভুগছেন। চিকিৎসকের পরামর্শ অনুযায়ী মাসিক ইনহেলার ও রক্তচাপের ওষুধ কেনার সামর্থ্য নেই।',
          beneficiaryName: 'কাসেম আলী (ছদ্মনাম)',
          beneficiaryAge: '৬৫ বছর',
          approxLat: 23.766,
          approxLng: 90.358,
          locationName: 'মোহাম্মদপুর, ঢাকা',
          urgency: 'জরুরি',
          requiredAssistance: 'সালবুটামল ইনহেলার ও প্রেসক্রিপশন অনুযায়ী এক মাসের ওষুধ',
          additionalInfo: 'প্রেসক্রিপশনটি স্থানীয় ফার্মেসিতে ভেরিফাই করা হয়েছে।',
          imageUrl:
            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
          status: 'সহায়তা চলছে',
          isVerified: true,
          volunteerNeeded: true,
          assignedVolunteerId: vol1.id,
        },
        {
          creatorId: user1.id,
          category: 'খাবার',
          title: 'অসুস্থ রিকশাচালক পরিবারের এক সপ্তাহের শুকনো খাবার সহায়তা',
          description:
            'গত সপ্তাহে দুর্ঘটনায় আহত হয়ে শয্যাশায়ী একজন রিকশাচালকের চার সদস্যের পরিবার চরম খাদ্য সংকটে পড়েছেন। চাল, ডাল, তেল, আলু ও লবণের প্রাথমিক বাজার প্রয়োজন।',
          beneficiaryName: 'রফিকুলের পরিবার (ছদ্মনাম)',
          beneficiaryAge: '৪০ বছর',
          approxLat: 23.792,
          approxLng: 90.407,
          locationName: 'মহাখালী কড়াইল সংলগ্ন, ঢাকা',
          urgency: 'জরুরি',
          requiredAssistance: '১০ কেজি চাল, ২ কেজি ডাল, ২ লিটার তেল ও আলু',
          additionalInfo: 'সরাসরি পরিবারের কাছে খাবার পৌঁছে দিতে সহায়তা প্রয়োজন।',
          imageUrl:
            'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80',
          status: 'সাহায্য প্রয়োজন',
          isVerified: true,
          volunteerNeeded: true,
        },
        {
          creatorId: user2.id,
          category: 'পোশাক',
          title: 'শীতকালে বস্তির এতিম শিশুদের জন্য গরম কাপড় ও চাদর',
          description:
            'ধানমন্ডি লেক সংলগ্ন অস্থায়ী বস্তিতে বাস করা ১০-১২ জন এতিম ও পথশিশুর জন্য সোয়েটার এবং শীতের চাদর প্রয়োজন। রাতে তীব্র শীতে শিশুরা কষ্ট পাচ্ছে।',
          beneficiaryName: 'বস্তির শিশুরা',
          beneficiaryAge: '৫-১০ বছর',
          approxLat: 23.746,
          approxLng: 90.375,
          locationName: 'ধানমন্ডি, ঢাকা',
          urgency: 'মাঝারি',
          requiredAssistance: 'শিশুদের সোয়েটার, মাফলার এবং কম্বল/চাদর',
          additionalInfo: 'ব্যবহৃত ভালো মানের পরিষ্কার শীতের কাপড়ও দেওয়া যাবে।',
          imageUrl:
            'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80',
          status: 'অনুমোদিত',
          isVerified: true,
          volunteerNeeded: false,
        },
        {
          creatorId: user1.id,
          category: 'বাসস্থান সহায়তা',
          title: 'ঝড়ে ভেঙে পড়া টিনের চাল মেরামতের জন্য সহায়তা',
          description:
            'সম্প্রতি কালবৈশাখী ঝড়ে বৃদ্ধা আমেনা বেগমের ঘরের চাল উড়ে গেছে। তিনি একজন বিধবা নারী। ঘরে বৃষ্টিতে পানি পড়ছে। ২টি টিন ও মেরামতের জন্য শ্রমিকের সহায়তা দরকার।',
          beneficiaryName: 'আমেনা বেগম (ছদ্মনাম)',
          beneficiaryAge: '৫৮ বছর',
          approxLat: 23.872,
          approxLng: 90.398,
          locationName: 'উত্তরা আজমপুর সংলগ্ন, ঢাকা',
          urgency: 'জরুরি',
          requiredAssistance: '২টি ঢেউ টিন ও বাঁশ/পেরেক কেনার সহায়তা',
          additionalInfo: 'স্থানীয় যুবসমাজ মেরামতের স্বেচ্ছাশ্রম দিতে প্রস্তুত।',
          imageUrl:
            'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&auto=format&fit=crop&q=80',
          status: 'সাহায্য প্রয়োজন',
          isVerified: true,
          volunteerNeeded: true,
        },
        {
          creatorId: user2.id,
          category: 'দৈনন্দিন প্রয়োজন',
          title: 'প্রতিবন্ধী তরুণের জন্য একটি হুইলচেয়ার প্রয়োজন',
          description:
            'জন্মগতভাবে পক্ষাঘাতগ্রস্ত ১৮ বছর বয়সী তরুণ সুমনের চলাচলের জন্য একটি সাধারণ ম্যানুয়াল হুইলচেয়ার প্রয়োজন। তার বাবা একজন দিনমজুর, যা কেনা তাদের পক্ষে অসম্ভব।',
          beneficiaryName: 'সুমন (ছদ্মনাম)',
          beneficiaryAge: '১৮ বছর',
          approxLat: 23.71,
          approxLng: 90.407,
          locationName: 'পুরান ঢাকা (চকবাজার), ঢাকা',
          urgency: 'মাঝারি',
          requiredAssistance: 'একটি স্বাভাবিক বা হালকা ব্যবহৃত সচল হুইলচেয়ার',
          additionalInfo: 'মেডিকেল সার্টিফিকেট সংরক্ষিত রয়েছে।',
          imageUrl:
            'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
          status: 'সম্পন্ন',
          isVerified: true,
          volunteerNeeded: false,
          completionNotes: 'স্থানীয় শুভাকাঙ্ক্ষীদের অর্থায়নে একটি নতুন হুইলচেয়ার হস্তান্তর করা হয়েছে।',
        },
        {
          creatorId: user1.id,
          category: 'জরুরি সহায়তা',
          title: 'আগুনে ক্ষতিগ্রস্ত চায়ের দোকানদারের পুনর্বাসন সহায়তা',
          description:
            'বৈদ্যুতিক শর্ট সার্কিটে পুড়ে যাওয়া চায়ের দোকানের কেটলি, ফ্লাস্ক ও সামান্য মালামাল কিনে পুনরায় দোকান চালু করার জন্য জরুরি সহায়তা প্রয়োজন।',
          beneficiaryName: 'মোতালেব মিয়া (ছদ্মনাম)',
          beneficiaryAge: '৪৮ বছর',
          approxLat: 23.753,
          approxLng: 90.39,
          locationName: 'ফার্মগেট, ঢাকা',
          urgency: 'জরুরি',
          requiredAssistance: 'কেটলি, কিছু কাপ-পিরিচ ও প্রাথমিক চা-চিনির বাজার',
          additionalInfo: 'স্থানীয় দোকান মালিক সমিতি সত্যতা যাচাই করেছে।',
          imageUrl:
            'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
          status: 'যাচাই হচ্ছে',
          isVerified: false,
          volunteerNeeded: false,
        },
      ]);

      // Demo notification for vol1
      await db.insert(notifications).values([
        {
          userId: vol1.id,
          title: 'নতুন সহায়তা কার্যক্রমে যুক্ত হয়েছেন',
          message:
            'আপনি "বৃদ্ধ চা বিক্রেতার হাঁপানির ইনহেলার ও জরুরি ওষুধ প্রয়োজন" কার্যক্রমে স্বেচ্ছাসেবী হিসেবে যুক্ত হয়েছেন।',
          link: '/requests/2',
          isRead: false,
        },
        {
          userId: user1.id,
          title: 'আপনার আবেদন অনুমোদিত হয়েছে',
          message:
            'আপনার আবেদন "ষষ্ঠ শ্রেণির এতিম শিক্ষার্থীর বই ও স্কুল ড্রেস সহায়তা" ভেরিফাই ও অনুমোদিত হয়েছে।',
          link: '/requests/1',
          isRead: true,
        },
      ]);
      console.log('Seeding completed successfully!');
    }
  } catch (error) {
    console.error('Error during database seed:', error);
  }
}
