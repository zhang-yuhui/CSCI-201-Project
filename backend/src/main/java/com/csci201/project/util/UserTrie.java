package com.csci201.project.util;

import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class UserTrie {
    
    private class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        boolean isEndOfWord;
        String username; // Store the actual username at the leaf
        Long userId;
        String email;
    }

    private final TrieNode root;

    public UserTrie() {
        root = new TrieNode();
    }

    // Insert a username (O(L))
    public synchronized void insert(Long userId, String username, String email) {
        TrieNode current = root;
        for (char ch : username.toLowerCase().toCharArray()) {
            current.children.putIfAbsent(ch, new TrieNode());
            current = current.children.get(ch);
        }
        current.isEndOfWord = true;
        current.username = username;
        current.userId = userId;
        current.email = email;
    }

    // Remove a username from the trie (best-effort; ignores missing entries)
    public synchronized void remove(String username) {
        if (username == null || username.isEmpty()) {
            return;
        }
        delete(root, username.toLowerCase(), 0);
    }

    private boolean delete(TrieNode node, String key, int depth) {
        if (depth == key.length()) {
            if (!node.isEndOfWord) {
                return false;
            }
            node.isEndOfWord = false;
            node.username = null;
            node.userId = null;
            node.email = null;
            return node.children.isEmpty();
        }

        char ch = key.charAt(depth);
        TrieNode child = node.children.get(ch);
        if (child == null) {
            return false;
        }

        boolean shouldDeleteChild = delete(child, key, depth + 1);
        if (shouldDeleteChild) {
            node.children.remove(ch);
        }

        return node.children.isEmpty() && !node.isEndOfWord;
    }

    // Search for usernames starting with prefix (O(L))
    public List<UserTrieResult> searchByPrefix(String prefix) {
        List<UserTrieResult> results = new ArrayList<>();
        if (prefix == null || prefix.isEmpty()) return results;

        TrieNode current = root;
        
        for (char ch : prefix.toLowerCase().toCharArray()) {
            if (!current.children.containsKey(ch)) {
                return results; // Return empty if prefix not found
            }
            current = current.children.get(ch);
        }
        
        // Perform DFS to find all complete words from this node
        findAllWords(current, results);
        return results;
    }

    private void findAllWords(TrieNode node, List<UserTrieResult> results) {
        if (node.isEndOfWord) {
            results.add(new UserTrieResult(node.userId, node.username, node.email));
        }
        for (TrieNode child : node.children.values()) {
            findAllWords(child, results);
        }
    }

    public static class UserTrieResult {
        private Long id;
        private String username;
        private String email;

        public UserTrieResult(Long id, String username, String email) {
            this.id = id;
            this.username = username;
            this.email = email;
        }

        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
    }
}
