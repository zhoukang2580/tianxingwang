package com.beeant.plugin.hcp.utils;
import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 *
 * <p/>
 * Utility class to calculate MD5 hash.
 *
 * @see MessageDigest
 */
public class MD5 {
    public  static  MD5 getInstance(){
        return new MD5();
    }
    private MessageDigest digest;

    /**
     * Class constructor.
     */
    private MD5() {
        try {
            digest = MessageDigest.getInstance("MD5");
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
    }

    /**
     * Write bytes, based on which we will calculate hash later on.
     *
     * @param bytes  bytes
     * @param length number of bytes to take
     */
    private void write(byte[] bytes, int length) {
        if (digest == null) {
            return;
        }

        digest.update(bytes, 0, length);
    }

    /**
     * Calculate hash based on the received bytes.
     *
     * @return md5 hash string
     */
    private String calculateHash() {
        if (digest == null) {
            return "";
        }

        byte[] md5sum = digest.digest();
        BigInteger bigInt = new BigInteger(1, md5sum);
        String output = bigInt.toString(16);

        // Fill to 32 chars
        return String.format("%32s", output).replace(' ', '0');
    }
    public String getHash(String path ) throws IOException {
        final InputStream input = new BufferedInputStream(new FileInputStream(path));
        final byte data[] = new byte[1024];
        int count;
        while ((count = input.read(data)) != -1) {
            this.write(data, count);
        }
        input.close();

        return calculateHash();
    }
}