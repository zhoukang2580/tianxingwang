package com.beeant.push;

import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Handler;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

import me.leolin.shortcutbadger.ShortcutBadger;

public class XiaomiBadgeHelper {
    private static final int notifyId = 0;
    //延迟操作

    public  void setBadge(Context context, int badge) {

        NotificationManager notificationManager =
                ((NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE));
        new Handler().postDelayed(new ShortCutRunnable(badge, BadgeUtils.getNotification(context,
                badge), notifyId,
                notificationManager), 600);
    }

    /**
     * 作者：GaoXiaoXiong
     * <p>
     * 创建时间:2018/4/8
     * <p>
     * 注释描述:延迟显示角标个数，解决小米不正确显示角标
     */

    class ShortCutRunnable implements Runnable {
        private int count;//要显示的个数

        private int notifId;//可以采用System.currentTimeMillis()

        private Notification notification;

        private NotificationManager notificationManager;

        public ShortCutRunnable(int count, Notification notification, int notifId,
                                NotificationManager notificationManager) {
            this.count = count;

            this.notification = notification;

            this.notifId = notifId;

            this.notificationManager = notificationManager;

        }

        @Override

        public void run() {
            try {
                ShortCutBadgerCount.getShortCutBadgerCount().clearCount();//我自己定义的

                Field field = notification.getClass().getDeclaredField("extraNotification");

                Object extraNotification = field.get(notification);

                Method method = extraNotification.getClass().getDeclaredMethod("setMessageCount",
                        int.class);

                method.invoke(extraNotification, count);//显示个数

            } catch (Exception e) {
//                BAFLogger.e(TAG, e.getMessage());
                e.printStackTrace();
            }

            notificationManager.notify(notifId, notification);//显示通知

        }

    }


    /**
     * 创建时间: 2018/4/4
     * <p>
     * gxx
     * <p>
     * 注释描述:角标个数
     */


    public static class ShortCutBadgerCount {
        private ShortCutBadgerCount() {
        }

        private int cutCount = 0;


        private static volatile ShortCutBadgerCount shortCutBadgerCount;

        public static ShortCutBadgerCount getShortCutBadgerCount() {
            if (shortCutBadgerCount == null) {
                synchronized (ShortCutBadgerCount.class) {
                    if (shortCutBadgerCount == null) {
                        shortCutBadgerCount = new ShortCutBadgerCount();

                    }

                }

            }

            return shortCutBadgerCount;

        }

        /**
         * 作者：GaoXiaoXiong
         * <p>
         * 创建时间:2018/4/4
         * <p>
         * 注释描述:添加1个角标
         */

        public int addCount() {
            this.cutCount += 1;

            setCutCount(this.cutCount);

            return cutCount;

        }

        /**
         * 作者：GaoXiaoXiong
         * <p>
         * 创建时间:2018/4/4
         * <p>
         * 注释描述:设置个数
         */

        public void setCutCount(int cutCount) {
            this.cutCount = cutCount;

        }

        /**
         * 作者：GaoXiaoXiong
         * <p>
         * 创建时间:2018/4/8
         * <p>
         * 注释描述:消息个数
         */

        public int getCutCount() {
            return cutCount;

        }

        /**
         * 作者：GaoXiaoXiong
         * <p>
         * 创建时间:2018/4/4
         * <p>
         * 注释描述:清零
         */

        public void clearCount() {
            cutCount = 0;

        }

        /**
         * 作者：GaoXiaoXiong
         * <p>
         * 创建时间:2018/4/8
         * <p>
         * 注释描述:销毁
         */

        public void destory() {
//            if (shortCutBadgerCount!=null){
//                removeShortcutBadgerACount(null);
//
//                shortCutBadgerCount=null;
//
//            }

        }

        /**
         * 作者：GaoXiaoXiong
         * <p>
         * 创建时间:2018/4/8
         * <p>
         * 注释描述:移除角标和清空统计的角标个数
         */

        public void removeShortcutBadgerACount(Context context) {
            ShortcutBadger.removeCount(context); //移除桌面角标

            ShortCutBadgerCount.getShortCutBadgerCount().clearCount();//清除个数

        }

    }
}
